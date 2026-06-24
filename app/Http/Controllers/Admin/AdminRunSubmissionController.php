<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RunSubmission;
use Inertia\Inertia;

class AdminRunSubmissionController extends Controller
{
    public function index()
    {
        return Inertia::render(
            'admin/run-submissions/Index',
            [
                'submissions' => RunSubmission::with([
                    'user',
                ])
                    ->latest()
                    ->get(),
            ]
        );
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

        $registrations = $runSubmission
            ->user
            ->registrations()
            ->where('status', 'approved')
            ->with('progress')
            ->get();

        foreach ($registrations as $registration) {

            if ($registration->progress) {

                $registration
                    ->progress
                    ->increment(
                        'completed_km',
                        $runSubmission->distance
                    );
            }
        }
        if (
            $registration->progress->completed_km >=
            $registration->eventCategory->target_km
        ) {
            $registration->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        }
        return back();
    }

    public function reject(
        RunSubmission $runSubmission
    ) {
        $runSubmission->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back();
    }
}
