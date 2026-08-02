<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Support\Emails;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRunSubmissionController extends Controller
{
    public function index(Request $request)
    {
        // Which status the admin is drilling into (all by default).
        $filter = $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        // Status counts come from the full table, independent of the page.
        $counts = RunSubmission::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $submissions = RunSubmission::with([
            'user',
            'registrations.eventCategory.event',
        ])
            ->when(
                in_array($filter, ['pending', 'approved', 'rejected'], true),
                fn ($query) => $query->where('status', $filter),
            )
            ->when($search !== '', fn ($query) => $query->whereHas('user', fn ($u) => $u
                ->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"])
                ->orWhere('runner_code', 'like', "%{$search}%")))
            ->latest()
            ->paginate(8)
            ->withQueryString()
            ->through(function (RunSubmission $submission) {

                $events = $submission->registrations->map(fn ($registration) => [
                    'event_name' => $registration->eventCategory?->event?->name,
                    'category_name' => $registration->eventCategory?->name,
                    'bib_number' => $registration->bib_number,
                ])->filter(fn ($tag) => $tag['event_name'])->values();

                return [
                    'id' => $submission->id,
                    'runner_name' => $submission->user?->full_name,
                    'runner_code' => $submission->user?->runner_code ?? '—',
                    'km' => (float) $submission->distance,
                    'run_date' => $submission->run_date?->format('M j, Y'),
                    'run_date_input' => $submission->run_date?->toDateString(),
                    'events' => $events,
                    'submitted_at' => $submission->created_at?->diffForHumans(),
                    'status' => $submission->status,
                    'photo_url' => $submission->photo
                        ? "/storage/{$submission->photo}"
                        : null,
                    'proof_link' => $submission->proof_link,
                    'notes' => $submission->notes,
                    'rejection_reason' => $submission->rejection_reason,
                ];
            });

        return Inertia::render('admin/run-submissions/Index', [

            'stats' => [
                [
                    'label' => 'Total',
                    'value' => (int) $counts->sum(),
                    'glow' => '#A6E212',
                ],
                ['label' => 'Pending', 'value' => (int) ($counts['pending'] ?? 0)],
                ['label' => 'Approved', 'value' => (int) ($counts['approved'] ?? 0)],
                ['label' => 'Rejected', 'value' => (int) ($counts['rejected'] ?? 0)],
            ],

            'submissions' => $submissions,

            // Which status tab is active (drives the filter UI).
            'filter' => $filter,
            'search' => $search,
        ]);
    }

    public function approve(
        RunSubmission $runSubmission
    ) {
        if (
            $runSubmission->status === 'approved'
        ) {
            return back();
        }

        $runSubmission->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Snapshot the runner's overall rank before crediting this run.
        $rankBefore = $this->overallRank($runSubmission->user_id);

        // Credit every registration the run was submitted against. Each one is
        // capped at its own target so a 5 km run on a 4 km goal only shows 4 km.
        $registrations = $runSubmission->registrations()
            ->where('registrations.status', 'approved')
            ->with('eventCategory')
            ->get();

        foreach ($registrations as $registration) {

            $target = (float) ($registration->eventCategory->target_km ?? 0);

            $capped = $target > 0
                ? min((float) $registration->completed_km + (float) $runSubmission->distance, $target)
                : (float) $registration->completed_km + (float) $runSubmission->distance;

            $registration->update([
                'completed_km' => $capped,
                'activity_count' => $registration->activity_count + 1,
                'last_activity_at' => now(),
            ]);

            if ($target > 0 && $capped >= $target) {
                $registration->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);
            }
        }

        // Group/duo events finish together: once the team's combined distance
        // reaches the shared goal, complete every member so no one can keep
        // submitting to a finished event (and each member earns a certificate).
        foreach ($registrations as $registration) {
            $this->completeTeamIfGoalReached($registration);
        }

        // Run-approved notification links to the (first) event's live board.
        $eventId = $registrations->first()?->eventCategory?->event_id;
        $boardUrl = $eventId
            ? route('events.board', $eventId)
            : route('my-runs.index');

        $this->email($runSubmission->user, Emails::runApproved($runSubmission, $boardUrl));

        $this->notifyUsers(
            $runSubmission->user,
            'Run approved',
            number_format((float) $runSubmission->distance, 2) . ' km has been credited to your event progress.',
            $boardUrl,
            'approval',
        );

        // Climbing into the overall Top 20 deserves its own notification.
        $rankAfter = $this->overallRank($runSubmission->user_id);
        if (
            $rankAfter !== null
            && $rankAfter <= 20
            && ($rankBefore === null || $rankBefore > 20)
        ) {
            $this->notifyUsers(
                $runSubmission->user,
                "You're in the Top 20! 🏆",
                "You've climbed to #{$rankAfter} on the overall leaderboard. Keep it up!",
                route('leaderboards.index'),
                'approval',
            );

            $this->email($runSubmission->user, Emails::reachedTopTwenty($rankAfter));
        }

        $this->toast('Run approved. Distance credited.');

        return back();
    }

    public function reject(
        Request $request,
        RunSubmission $runSubmission
    ) {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        $runSubmission->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $this->email(
            $runSubmission->user,
            Emails::runRejected($runSubmission, $validated['rejection_reason']),
        );

        $this->notifyUsers(
            $runSubmission->user,
            'Run rejected',
            "Your run submission was rejected: {$validated['rejection_reason']}.",
            route('my-runs.index'),
            'rejection',
        );

        $this->toast('Run submission rejected.');

        return back();
    }

    /**
     * Edit a run submission — including one that is already approved.
     *
     * Correcting the distance of an approved run changes how much it credited,
     * so every linked registration is recomputed afterwards to keep event
     * progress (and completion) accurate.
     */
    public function update(Request $request, RunSubmission $runSubmission)
    {
        $validated = $request->validate([
            'distance' => ['required', 'numeric', 'min:0.1'],
            'run_date' => ['required', 'date', 'before_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $runSubmission->update([
            'distance' => $validated['distance'],
            'run_date' => $validated['run_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        if ($runSubmission->status === 'approved') {
            $registrations = $runSubmission->registrations()
                ->with('eventCategory')
                ->get();

            foreach ($registrations as $registration) {
                $this->recomputeRegistration($registration);
            }
        }

        $this->toast('Run submission updated.');

        return back();
    }

    /**
     * Permanently delete an incorrectly-entered run submission.
     *
     * If the run had already been approved its distance was credited to every
     * linked registration, so we first recompute each of those registrations
     * from the runs that remain — reversing the credited km, fixing the
     * activity count, and rolling back a completion (plus its certificate) if
     * the runner no longer meets the goal without this run.
     */
    public function destroy(RunSubmission $runSubmission)
    {
        $wasApproved = $runSubmission->status === 'approved';

        // Capture the affected registrations before the pivot rows disappear.
        $registrations = $wasApproved
            ? $runSubmission->registrations()->with('eventCategory')->get()
            : collect();

        $runSubmission->delete();

        foreach ($registrations as $registration) {
            $this->recomputeRegistration($registration);
        }

        $this->toast('Run submission deleted.');

        return back();
    }

    /**
     * Rebuild a registration's progress from the approved runs that remain
     * linked to it, keeping completed_km, activity_count, last_activity_at and
     * completion status consistent after a run is removed.
     */
    private function recomputeRegistration(Registration $registration): void
    {
        // Only credited registrations (approved/completed) track progress.
        if (! in_array($registration->status, ['approved', 'completed'], true)) {
            return;
        }

        $target = (float) ($registration->eventCategory->target_km ?? 0);

        $runs = RunSubmission::query()
            ->where('status', 'approved')
            ->whereHas(
                'registrations',
                fn ($query) => $query->where('registrations.id', $registration->id),
            )
            ->get();

        $total = (float) $runs->sum('distance');
        $capped = $target > 0 ? min($total, $target) : $total;
        $wasCompleted = $registration->status === 'completed';
        $nowCompleted = $target > 0 && $capped >= $target;

        $registration->completed_km = $capped;
        $registration->activity_count = $runs->count();
        $registration->last_activity_at = $runs->max('created_at');

        if ($nowCompleted && ! $wasCompleted) {
            // Newly reached the goal (e.g. an edit raised the distance): mark
            // completed so the certificate observer issues the certificate.
            $registration->status = 'completed';
            $registration->completed_at = $registration->completed_at ?? now();
        } elseif ($wasCompleted && ! $nowCompleted) {
            // No longer a finisher: revert to in-progress and revoke the
            // certificate that completion had issued.
            $registration->status = 'approved';
            $registration->completed_at = null;
            $registration->certificate()->delete();
        }

        $registration->save();
    }

    /**
     * Complete an entire team once its combined distance hits the shared goal.
     * Updates run per-model so the certificate observer fires for each member.
     */
    private function completeTeamIfGoalReached(Registration $registration): void
    {
        $registration->loadMissing('group.registrations.eventCategory', 'eventCategory.event');
        $group = $registration->group;

        if (! $group || $registration->eventCategory?->event?->preset !== 'group') {
            return;
        }

        $active = $group->registrations->whereIn('status', ['approved', 'completed']);
        $goal = (float) $active->max(fn ($r) => (float) ($r->eventCategory?->target_km ?? 0));
        $done = (float) $active->sum('completed_km');

        if ($goal <= 0 || $done < $goal) {
            return;
        }

        foreach ($group->registrations()->where('status', 'approved')->get() as $member) {
            $member->update(['status' => 'completed', 'completed_at' => now()]);
        }
    }

    /**
     * The runner's position on the overall leaderboard (by total approved +
     * completed distance), or null if they haven't logged any distance.
     */
    private function overallRank(int $userId): ?int
    {
        $order = RunSubmission::query()
            ->where('status', 'approved')
            ->selectRaw('user_id, SUM(distance) as total')
            ->groupBy('user_id')
            ->havingRaw('SUM(distance) > 0')
            ->orderByDesc('total')
            ->pluck('user_id')
            ->values();

        $index = $order->search($userId);

        return $index === false ? null : $index + 1;
    }
}
