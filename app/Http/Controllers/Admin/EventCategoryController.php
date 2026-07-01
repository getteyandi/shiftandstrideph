<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/event-categories/Index', [
            'categories' => EventCategory::with('event')
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(?Event $event = null)
    {
        // When reached through /admin/events/{event}/setup the category form is
        // scoped to a single draft event; otherwise it falls back to a picker.
        $event?->load('categories');

        return Inertia::render('admin/event-categories/Create', [
            'event' => $event,
            'events' => $event
                ? null
                : Event::select('id', 'name')
                    ->orderBy('name')
                    ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'name' => ['required', 'max:255'],
            'target_km' => ['required', 'numeric', 'min:1'],
            'registration_limit' => ['nullable', 'integer', 'min:1'],
            'ranking_enabled' => ['required', 'boolean'],
        ]);

        $validated['target_km'] = round((float) $validated['target_km'], 2);

        EventCategory::create($validated);

        $this->toast('Category added.');

        // Stay on the setup page so the admin can keep adding categories;
        // they leave via the "Done" button when finished.
        return back();
    }

    public function edit(EventCategory $eventCategory)
    {
        return Inertia::render('admin/event-categories/Edit', [
            'category' => $eventCategory,
            'events' => Event::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(
        Request $request,
        EventCategory $eventCategory
    ) {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'name' => ['required', 'max:255'],
            'target_km' => ['required', 'numeric', 'min:1'],
            'registration_limit' => ['nullable', 'integer', 'min:1'],
            'ranking_enabled' => ['required', 'boolean'],
        ]);

        $validated['target_km'] = round((float) $validated['target_km'], 2);

        $eventCategory->update($validated);

        return redirect()->route('admin.event-categories.index');
    }

    public function destroy(EventCategory $eventCategory)
    {
        $eventCategory->delete();

        $this->toast('Category removed.');

        return back();
    }
}
