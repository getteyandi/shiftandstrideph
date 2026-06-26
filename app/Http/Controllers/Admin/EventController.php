<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'active');

        $statusMap = [
            'active' => ['open', 'upcoming'],
            'open' => ['open'],
            'upcoming' => ['upcoming'],
            'past' => ['closed', 'completed'],
        ];

        return Inertia::render('admin/events/Index', [

            'events' => Event::query()
                ->with('categories')
                ->where('is_published', true)
                ->when(
                    isset($statusMap[$filter]),
                    fn ($query) => $query->whereIn('status', $statusMap[$filter]),
                )
                ->latest()
                ->paginate(10)
                ->withQueryString(),

            'draftEvents' => Event::query()
                ->where('is_published', false)
                ->latest()
                ->get(),

            'filter' => $filter,

        ]);
    }

    public function create()
    {
        return Inertia::render('admin/events/Create', [
            'draftEvents' => Event::query()
                ->where('is_published', false)
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],

            'banner' => ['nullable', 'image', 'max:5120'],

            'registration_start' => ['required', 'date'],
            'registration_end' => ['required', 'date', 'after_or_equal:registration_start'],

            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],

            'status' => [
                'required',
                'in:upcoming,open,closed,completed',
            ],
        ]);

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request
                ->file('banner')
                ->store('events', 'public');
        }

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure the slug is unique
        $originalSlug = $validated['slug'];
        $count = 1;

        while (Event::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = "{$originalSlug}-{$count}";
            $count++;
        }

        $validated['is_published'] = false;

        $event = Event::create($validated);

        $this->toast('Draft created. Now add its race categories.');

        // Step 2 of the pipeline: send the admin straight into category setup
        // for the freshly created draft.
        return redirect()->route('admin.events.setup', $event);
    }

    public function show(Event $event)
    {
        $event->load([
            'categories' => fn ($query) => $query->orderBy('sort_order'),
            'categories.registrations.user',
        ]);

        $participants = $event->categories
            ->flatMap(fn ($category) => $category->registrations->map(fn ($registration) => [
                'id' => $registration->id,
                'runner' => $registration->user?->full_name,
                'runner_code' => $registration->user?->runner_code,
                'profile_photo' => $registration->user?->profile_photo,
                'category_name' => $category->name,
                'bib_number' => $registration->bib_number,
                'status' => $registration->status,
                'completed_km' => (float) $registration->completed_km,
                'target_km' => (float) $category->target_km,
            ]))
            ->values();

        return Inertia::render('admin/events/Show', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'banner' => $event->banner,
                'location' => $event->location,
                'status' => $event->status,
                'registration_start' => $event->registration_start?->format('M j, Y g:i A'),
                'registration_end' => $event->registration_end?->format('M j, Y g:i A'),
                'start_date' => $event->start_date?->format('M j, Y'),
                'end_date' => $event->end_date?->format('M j, Y'),
                'categories' => $event->categories->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'target_km' => (float) $category->target_km,
                    'registration_limit' => $category->registration_limit,
                    'joined' => $category->registrations->count(),
                ]),
            ],
            'participants' => $participants,
        ]);
    }

    public function edit(Event $event)
    {
        // History events (closed/completed) are viewable but locked.
        if ($event->isHistory()) {
            $this->toast('This event is closed and can no longer be edited.', 'error');

            return redirect()->route('admin.events.index');
        }

        return Inertia::render('admin/events/Edit', [
            'event' => $event,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        if ($event->isHistory()) {
            $this->toast('This event is closed and can no longer be edited.', 'error');

            return redirect()->route('admin.events.index');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],

            'banner' => ['nullable', 'image', 'max:5120'],

            'registration_start' => ['required', 'date'],
            'registration_end' => ['required', 'date', 'after_or_equal:registration_start'],

            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],

            'status' => [
                'required',
                'in:upcoming,open,closed,completed',
            ],
        ]);

        if ($request->hasFile('banner')) {

            if ($event->banner) {
                Storage::disk('public')->delete($event->banner);
            }

            $validated['banner'] = $request
                ->file('banner')
                ->store('events', 'public');
        }

        $validated['slug'] = Str::slug($validated['name']);

        $originalSlug = $validated['slug'];
        $count = 1;

        while (
            Event::where('slug', $validated['slug'])
            ->where('id', '!=', $event->id)
            ->exists()
        ) {
            $validated['slug'] = "{$originalSlug}-{$count}";
            $count++;
        }

        $event->update($validated);

        $this->toast('Event updated successfully.');

        return redirect()->route('admin.events.index');
    }

    public function publish(Event $event)
    {
        $event->update([
            'is_published' => ! $event->is_published,
        ]);

        $this->toast(
            $event->is_published
                ? 'Event published successfully.'
                : 'Event moved back to drafts.'
        );

        return back();
    }

    public function destroy(Event $event)
    {
        if ($event->banner) {
            Storage::disk('public')->delete($event->banner);
        }

        $event->delete();

        $this->toast('Event deleted successfully.');

        return redirect()->route('admin.events.index');
    }
}
