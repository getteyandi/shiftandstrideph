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

    public function create()
    {
        return Inertia::render('admin/event-categories/Create', [
            'events' => Event::select('id', 'title')
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'name' => ['required', 'max:255'],
            'target_km' => ['required', 'numeric', 'min:1'],
            'ranking_enabled' => ['required', 'boolean'],
        ]);

        EventCategory::create($validated);

        return redirect()->route('event-categories.index');
    }

    public function edit(EventCategory $eventCategory)
    {
        return Inertia::render('admin/event-categories/Edit', [
            'category' => $eventCategory,
            'events' => Event::select('id', 'title')->get(),
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
            'ranking_enabled' => ['required', 'boolean'],
        ]);

        $eventCategory->update($validated);

        return redirect()->route('event-categories.index');
    }

    public function destroy(EventCategory $eventCategory)
    {
        $eventCategory->delete();

        return redirect()->route('event-categories.index');
    }
}
