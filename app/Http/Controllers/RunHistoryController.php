<?php

namespace App\Http\Controllers;

use App\Models\RunSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RunHistoryController extends Controller
{
    public function index()
    {
        $runs = RunSubmission::with('registrations.eventCategory.event')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10)
            ->through(fn (RunSubmission $run) => [
                'id' => $run->id,
                'distance' => (float) $run->distance,
                'status' => $run->status,
                'notes' => $run->notes,
                'date' => $run->created_at?->format('M j, Y'),
                'reviewed_at' => $run->reviewed_at?->format('M j, Y'),
                'rejection_reason' => $run->rejection_reason,
                'photo_url' => $run->photo ? "/storage/{$run->photo}" : null,
                'proof_link' => $run->proof_link,
                'events' => $run->registrations
                    ->map(fn ($r) => [
                        'event_name' => $r->eventCategory?->event?->name,
                        'category_name' => $r->eventCategory?->name,
                    ])
                    ->filter(fn ($e) => $e['event_name'])
                    ->unique('event_name')
                    ->values(),
            ]);

        $all = RunSubmission::where('user_id', auth()->id());

        return Inertia::render('run-history/Index', [
            'runs' => $runs,
            'stats' => [
                'total' => (clone $all)->count(),
                'approved' => (clone $all)->where('status', 'approved')->count(),
                'pending' => (clone $all)->where('status', 'pending')->count(),
                'total_km' => round((float) (clone $all)->where('status', 'approved')->sum('distance'), 2),
            ],
        ]);
    }
}
