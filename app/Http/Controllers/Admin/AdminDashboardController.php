<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/dashboard', [

            'stats' => [
                'total_users' => User::count(),
                'total_events' => Event::count(),
                'total_registrations' => Registration::count(),
                'total_submissions' => RunSubmission::count(),

                'pending_users' => User::where('status', 'pending')->count(),
                'pending_registrations' => Registration::where('status', 'pending')->count(),
                'pending_submissions' => RunSubmission::where('status', 'pending')->count(),
            ],

            // Progress trackers for published, ongoing/open events.
            'eventTrackers' => $this->eventTrackers(),

            // Recent registrations (newest first, capped at 5).
            'recentRegistrations' => Registration::with([
                'user',
                'eventCategory.event',
            ])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (Registration $registration) => [
                    'id' => $registration->id,
                    'runner' => $registration->user?->full_name,
                    'event' => $registration->eventCategory?->event?->name,
                    'category' => $registration->eventCategory?->name,
                    'bib_number' => $registration->bib_number,
                    'status' => $registration->status,
                    'created_at' => $registration->created_at?->format('M d, Y'),
                ]),

            // Recent user sign-ups (newest first, capped at 5).
            'recentUsers' => User::latest()
                ->take(5)
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'runner_code' => $user->runner_code,
                    'created_at' => $user->created_at?->format('M d, Y'),
                ]),

            // Recent run submissions (newest first, capped at 5).
            'recentSubmissions' => RunSubmission::with('user')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (RunSubmission $submission) => [
                    'id' => $submission->id,
                    'runner' => $submission->user?->full_name,
                    'distance' => (float) $submission->distance,
                    'status' => $submission->status,
                    'created_at' => $submission->created_at?->format('M d, Y'),
                ]),
        ]);
    }

    /**
     * Build distance-completion trackers for published events that are
     * currently ongoing (or open for registration).
     *
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    protected function eventTrackers()
    {
        $now = Carbon::now();

        return Event::query()
            ->with('categories.registrations')
            ->where('is_published', true)
            ->where(function ($query) use ($now) {
                $query->where('status', 'open')
                    ->orWhere(function ($q) use ($now) {
                        $q->where('start_date', '<=', $now)
                            ->where('end_date', '>=', $now);
                    });
            })
            ->orderBy('end_date')
            ->get()
            ->map(function (Event $event) {

                $targetKm = 0.0;
                $completedKm = 0.0;
                $participants = 0;

                foreach ($event->categories as $category) {

                    $registrations = $category->registrations
                        ->whereIn('status', ['approved', 'completed']);

                    $participants += $registrations->count();

                    foreach ($registrations as $registration) {
                        $targetKm += (float) $category->target_km;
                        $completedKm += (float) $registration->completed_km;
                    }
                }

                $percentage = $targetKm > 0
                    ? min(100, round(($completedKm / $targetKm) * 100, 1))
                    : 0;

                $remaining = max(0, round($targetKm - $completedKm, 2));

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'location' => $event->location,
                    'status' => $event->status,
                    'banner' => $event->banner,
                    'is_highlighted' => (bool) $event->is_highlighted,
                    'preset' => $event->preset,
                    'end_date' => $event->end_date?->format('M d, Y'),
                    'participants' => $participants,
                    'target_km' => round($targetKm, 2),
                    'completed_km' => round($completedKm, 2),
                    'remaining_km' => $remaining,
                    'percentage' => $percentage,
                ];
            })
            ->values();
    }
}
