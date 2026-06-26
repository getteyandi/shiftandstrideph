<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

        $this->toast('Run submission rejected.');

        return back();
    }
}
