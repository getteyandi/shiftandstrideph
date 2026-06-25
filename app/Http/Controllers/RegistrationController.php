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
    public function index()
    {
        $user = Auth::user();

        $events = Event::with([
            'categories' => fn($query) => $query->orderBy('sort_order'),
        ])
            ->orderByDesc('start_date')
            ->get();

        return Inertia::render('events/Index', [
            'events' => $events->map(function (Event $event) use ($user) {

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
                        ->sum(fn($category) => $category->registrations()->count()),

                    'categories' => $event
                        ->categories
                        ->pluck('name')
                        ->values(),

                    'banner' => $event->banner,

                    // Optional for later
                    // 'is_registered' => $event->categories
                    //     ->contains(fn ($category) =>
                    //         $category->registrations()
                    //             ->where('user_id', $user->id)
                    //             ->exists()),
                ];
            }),

            'filters' => [
                'All',
                'Open',
                'Marathon',
                'Ultra',
            ],
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

        $alreadyRegistered = Registration::where('user_id', $user->id)
            ->where('event_category_id', $validated['event_category_id'])
            ->exists();

        if ($alreadyRegistered) {
            return back()->with(
                'error',
                'You are already registered for this category.'
            );
        }

        $registrationCount = Registration::where(
            'event_category_id',
            $validated['event_category_id']
        )->count() + 1;

        Registration::create([

            'user_id' => $user->id,

            'event_category_id' => $validated['event_category_id'],

            'bib_number' => sprintf(
                'BIB-%05d',
                $registrationCount
            ),

            'status' => 'approved',

            'completed_km' => 0,

            'activity_count' => 0,

            'last_activity_at' => null,

            'approved_at' => now(),

        ]);

        return redirect()
            ->route('dashboard')
            ->with(
                'success',
                'You have successfully joined the event!'
            );
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
