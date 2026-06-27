<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index()
    {
        return Inertia::render('leaderboards/Index', [

            'overall' => $this->overallRanking(),
            'eventRankings' => $this->eventRankings(),
            'newestFinishers' => $this->newestFinishers(),
            'totalRunners' => User::where('role', 'participant')->count(),
        ]);
    }

    /**
     * Total approved distance per runner across every event.
     */
    protected function overallRanking()
    {
        return User::query()
            ->where('role', 'participant')
            ->with(['registrations' => fn ($q) => $q
                ->whereIn('status', ['approved', 'completed'])
                ->with('eventCategory.event')])
            ->get()
            ->map(function (User $user) {
                $completed = $user->registrations->where('status', 'completed');
                $recent = $completed
                    ->sortByDesc('completed_at')
                    ->first();

                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'initials' => $user->initials,
                    'city' => $user->city ?? '—',
                    'photo' => $user->profile_photo,
                    'events' => $user->registrations->count(),
                    'completed' => $completed->count(),
                    'km' => round((float) $user->registrations->sum('completed_km'), 2),
                    'recent' => $recent
                        ? "{$recent->eventCategory?->event?->name} Finisher"
                        : null,
                ];
            })
            ->filter(fn ($row) => $row['km'] > 0)
            ->sortByDesc('km')
            ->values();
    }

    /**
     * Top 3 distance leaders for each published event.
     */
    protected function eventRankings()
    {
        return Event::query()
            ->where('is_published', true)
            ->with(['categories.registrations.user'])
            ->get()
            ->map(function (Event $event) {

                $top = $event->categories
                    ->flatMap(fn ($category) => $category->registrations
                        ->whereIn('status', ['approved', 'completed'])
                        ->map(fn ($registration) => [
                            'id' => $registration->id,
                            'name' => $registration->user?->full_name,
                            'initials' => $registration->user?->initials,
                            'photo' => $registration->user?->profile_photo,
                            'category' => $category->name,
                            'km' => round((float) $registration->completed_km, 2),
                        ]))
                    ->filter(fn ($row) => $row['km'] > 0)
                    ->sortByDesc('km')
                    ->take(3)
                    ->values();

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'location' => $event->location,
                    'top' => $top,
                ];
            })
            ->filter(fn ($event) => $event['top']->isNotEmpty())
            ->values();
    }

    /**
     * Most recent runners to complete an event.
     */
    protected function newestFinishers()
    {
        return Registration::query()
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', now()->subDay())
            ->with(['user', 'eventCategory.event'])
            ->latest('completed_at')
            ->take(12)
            ->get()
            ->map(fn (Registration $registration) => [
                'id' => $registration->id,
                'name' => $registration->user?->full_name,
                'initials' => $registration->user?->initials,
                'photo' => $registration->user?->profile_photo,
                'city' => $registration->user?->city ?? '—',
                'km' => round((float) $registration->completed_km, 2),
                'event' => $registration->eventCategory?->event?->name,
                'category' => $registration->eventCategory?->name,
                'finished_at' => $registration->completed_at?->diffForHumans(),
            ]);
    }
}
