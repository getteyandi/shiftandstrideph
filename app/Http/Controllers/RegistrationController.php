<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $filter = $request->query('filter', 'active');

        $statusMap = [
            'active' => ['open', 'upcoming'],
            'open' => ['open'],
            'upcoming' => ['upcoming'],
            'past' => ['closed', 'completed'],
        ];

        $events = Event::with([
            'categories' => fn ($query) => $query->orderBy('sort_order'),
        ])
            ->where('is_published', true)
            ->when(
                isset($statusMap[$filter]),
                fn ($query) => $query->whereIn('status', $statusMap[$filter]),
            )
            ->orderByDesc('start_date')
            ->get();

        // The runner's own join history across every event/category (paginated).
        $joinedEvents = Registration::with(['eventCategory.event'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(5, ['*'], 'joined')
            ->withQueryString()
            ->through(fn (Registration $registration) => [
                'id' => $registration->id,
                'event_name' => $registration->eventCategory?->event?->name,
                'category_name' => $registration->eventCategory?->name,
                'target_km' => (float) ($registration->eventCategory?->target_km ?? 0),
                'completed_km' => (float) $registration->completed_km,
                'bib_number' => $registration->bib_number,
                'status' => $registration->status,
                'joined_at' => $registration->created_at?->format('M j, Y'),
            ]);

        return Inertia::render('events/Index', [
            'events' => $events->map(function (Event $event) {

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'location' => $event->location,
                    'dates' => sprintf(
                        '%s - %s',
                        $event->start_date->format('M j'),
                        $event->end_date->format('M j, Y'),
                    ),
                    'status' => ucfirst($event->status),
                    'joined_count' => $event
                        ->categories
                        ->sum(fn ($category) => $category->registrations()->count()),
                    'categories' => $event
                        ->categories
                        ->pluck('name')
                        ->values(),
                    'banner' => $event->banner,
                ];
            }),

            'joinedEvents' => $joinedEvents,

            'filter' => $filter,
        ]);
    }

    public function show(Event $event)
    {
        $user = Auth::user();

        $event->load([
            'categories' => fn($query) => $query->orderBy('sort_order'),
        ]);

        $registeredCategories = Registration::where('user_id', $user->id)
            ->whereIn(
                'event_category_id',
                $event->categories->pluck('id')
            )
            ->pluck('event_category_id');

        return Inertia::render('events/show', [

            'event' => [

                'id' => $event->id,

                'name' => $event->name,

                'description' => $event->description,

                'banner' => $event->banner,

                'location' => $event->location,

                'dates' => sprintf(
                    '%s - %s',
                    $event->start_date->format('M j'),
                    $event->end_date->format('M j, Y'),
                ),

                'status' => ucfirst($event->status),

                'categories' => $event->categories->map(fn($category) => [

                    'id' => $category->id,

                    'name' => $category->name,

                    'target_km' => $category->target_km,

                    'ranking_enabled' => $category->ranking_enabled,

                    'is_registered' => $registeredCategories
                        ->contains($category->id),

                ]),

            ],

        ]);
    }

    public function store(Request $request, Event $event)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'event_category_id' => [
                'required',
                Rule::exists('event_categories', 'id')
                    ->where('event_id', $event->id),
            ],
        ]);

        // Can't join a closed/completed (history) event.
        if ($event->isHistory()) {
            $this->toast('Registration for this event is closed.', 'error');

            return back();
        }

        $alreadyRegistered = Registration::where('user_id', $user->id)
            ->where('event_category_id', $validated['event_category_id'])
            ->exists();

        if ($alreadyRegistered) {
            $this->toast('You are already registered for this category.', 'error');

            return back();
        }

        $registrationCount = Registration::where(
            'event_category_id',
            $validated['event_category_id']
        )->count() + 1;

        $registration = Registration::create([

            'user_id' => $user->id,

            'event_category_id' => $validated['event_category_id'],

            'bib_number' => sprintf(
                'BIB-%05d',
                $registrationCount
            ),

            'status' => 'pending',

            'completed_km' => 0,

            'activity_count' => 0,

            'last_activity_at' => null,

            'approved_at' => null,

        ]);

        // Close registration if this join filled the event's quota.
        $registration->loadMissing('eventCategory.event');
        $registration->eventCategory?->event?->closeIfQuotaReached();

        $this->toast('Registration submitted! An admin will review it shortly.');

        return redirect()->route('dashboard');
    }

    // public function store(Request $request)
    // {

    //     $validated = $request->validate([
    //         'event_category_id' => [
    //             'required',
    //             'exists:event_categories,id',
    //         ],
    //     ]);

    //     $existing = Registration::where('user_id', auth()->id())
    //         ->where('event_category_id', $validated['event_category_id'])
    //         ->exists();

    //     if ($existing) {
    //         return back()->withErrors([
    //             'registration' => 'You are already registered for this category.'
    //         ]);
    //     }

    //     $registration = Registration::create([
    //         'user_id' => auth()->id(),
    //         'event_category_id' => $validated['event_category_id'],
    //         'status' => 'pending',
    //     ]);

    //     $registration->progress()->create([
    //         'completed_km' => 0,
    //     ]);

    //     return back();
    // }
}
