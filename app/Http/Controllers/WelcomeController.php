<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Public one-page landing.
     *
     * Exposes only non-sensitive, aggregate event information for the marquee
     * carousel — never runner identities, bib numbers, submissions, or any
     * per-participant data. Highlighted events are surfaced first so the
     * carousel can give them visual priority.
     */
    public function index(): Response
    {
        $events = Event::query()
            ->with(['categories' => fn ($query) => $query->orderBy('sort_order')])
            ->where('is_published', true)
            ->whereIn('status', ['open', 'upcoming'])
            // Featured events first, then soonest-starting.
            ->orderByDesc('is_highlighted')
            ->orderBy('start_date')
            ->take(8)
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
                'location' => $event->location,
                'description' => $event->description,
                'dates' => sprintf(
                    '%s – %s',
                    $event->start_date->format('M j'),
                    $event->end_date->format('M j, Y'),
                ),
                'status' => ucfirst($event->status),
                'is_highlighted' => (bool) $event->is_highlighted,
                'preset' => $event->preset,
                'banner' => $event->banner,
                'categories' => $event->categories
                    ->pluck('name')
                    ->take(4)
                    ->values(),
                // Aggregate head-count only — never individual runner data.
                'runners_count' => (int) $event->categories->sum(
                    fn ($category) => $category->registrations()
                        ->whereIn('status', ['approved', 'completed'])
                        ->count(),
                ),
            ])
            ->values();

        return Inertia::render('welcome', [
            'events' => $events,
        ]);
    }
}
