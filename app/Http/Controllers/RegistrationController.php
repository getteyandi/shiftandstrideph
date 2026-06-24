<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index()
    {
        return Inertia::render('users/Index', [
            'events' => Event::with('categories')->get(),
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'event_category_id' => [
                'required',
                'exists:event_categories,id',
            ],
        ]);

        $existing = Registration::where('user_id', auth()->id())
            ->where('event_category_id', $validated['event_category_id'])
            ->exists();

        if ($existing) {
            return back()->withErrors([
                'registration' => 'You are already registered for this category.'
            ]);
        }

        $registration = Registration::create([
            'user_id' => auth()->id(),
            'event_category_id' => $validated['event_category_id'],
            'status' => 'pending',
        ]);

        $registration->progress()->create([
            'completed_km' => 0,
        ]);

        return back();
    }
}
