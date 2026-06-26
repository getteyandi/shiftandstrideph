<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\RunSubmission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RunSubmissionController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // Only approved registrations whose event isn't completed can receive
        // a run. Completed registrations/events are excluded entirely.
        $registrations = Registration::with([
            'eventCategory.event',
        ])
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->whereHas('eventCategory.event', function ($query) {
                $query->where('status', '!=', 'completed');
            })
            ->get()
            ->map(fn (Registration $registration) => [
                'id' => $registration->id,
                'event_name' => $registration->eventCategory?->event?->name,
                'category_name' => $registration->eventCategory?->name,
                'bib_number' => $registration->bib_number,
                'distance_done' => (float) $registration->completed_km,
                'target_km' => (float) ($registration->eventCategory?->target_km ?? 0),
            ])
            ->values();

        $recentSubmissions = RunSubmission::with(
            'registrations.eventCategory.event'
        )
            ->where('user_id', $userId)
            ->latest()
            ->paginate(6)
            ->withQueryString()
            ->through(fn (RunSubmission $submission) => [
                'id' => $submission->id,
                'km' => (float) $submission->distance,
                'date' => $submission->created_at?->format('M j, Y'),
                'status' => strtoupper($submission->status),
                'events' => $submission->registrations
                    ->map(fn ($registration) => $registration->eventCategory?->event?->name)
                    ->filter()
                    ->unique()
                    ->values(),
                'proof_thumb_url' => $submission->photo
                    ? "/storage/{$submission->photo}"
                    : null,
            ]);

        return Inertia::render('run-submissions/Index', [
            'activeRegistrations' => $registrations,
            'recentSubmissions' => $recentSubmissions,
            'runDate' => now()->format('M j, Y'),
        ]);
    }

    public function store(Request $request)
    {
        $userId = auth()->id();

        $validated = $request->validate([
            // The run can count toward several chosen registrations at once.
            'registration_ids' => ['required', 'array', 'min:1'],
            'registration_ids.*' => [
                Rule::exists('registrations', 'id')
                    ->where('user_id', $userId),
            ],

            'distance' => ['required', 'numeric', 'min:0.1'],
            'photo' => ['required', 'image', 'max:5120'],
            'notes' => ['nullable', 'string'],
        ]);

        $registrations = Registration::with('eventCategory.event')
            ->where('user_id', $userId)
            ->whereIn('id', $validated['registration_ids'])
            ->get();

        // Guard: every chosen registration must be approved and in-progress.
        foreach ($registrations as $registration) {
            if ($registration->status !== 'approved') {
                return back()->withErrors([
                    'registration_ids' => 'You can only submit runs to approved, in-progress events.',
                ]);
            }

            if ($registration->eventCategory?->event?->status === 'completed') {
                return back()->withErrors([
                    'registration_ids' => 'One of the selected events has already been completed.',
                ]);
            }
        }

        $path = $request
            ->file('photo')
            ->store('run-submissions', 'public');

        $submission = RunSubmission::create([
            'user_id' => $userId,
            'distance' => $validated['distance'],
            'photo' => $path,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        // Link the submission to each chosen registration via the pivot.
        $submission->registrations()->sync($registrations->pluck('id'));

        $this->toast('Run submitted for review.');

        return redirect()->route('dashboard');
    }
}
