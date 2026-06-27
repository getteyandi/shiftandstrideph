<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Notifications\RunApprovedNotification;
use App\Notifications\RunRejectedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRunSubmissionController extends Controller
{
    public function index()
    {
        // Status counts come from the full table, independent of the page.
        $counts = RunSubmission::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $submissions = RunSubmission::with([
            'user',
            'registrations.eventCategory.event',
        ])
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

        $runSubmission->user->notify(
            new RunApprovedNotification()
        );

        // Run-approved notification links to the (first) event's live board.
        $eventId = $registrations->first()?->eventCategory?->event_id;
        $boardUrl = $eventId
            ? route('events.board', $eventId)
            : route('my-runs.index');

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

        $runSubmission->user->notify(
            new RunRejectedNotification()
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
     * The runner's position on the overall leaderboard (by total approved +
     * completed distance), or null if they haven't logged any distance.
     */
    private function overallRank(int $userId): ?int
    {
        $order = Registration::query()
            ->whereIn('status', ['approved', 'completed'])
            ->selectRaw('user_id, SUM(completed_km) as total')
            ->groupBy('user_id')
            ->havingRaw('SUM(completed_km) > 0')
            ->orderByDesc('total')
            ->pluck('user_id')
            ->values();

        $index = $order->search($userId);

        return $index === false ? null : $index + 1;
    }
}
