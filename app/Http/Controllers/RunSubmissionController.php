<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\RunSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RunSubmissionController extends Controller
{
    public function index()
    {
        $registrations = Registration::with([
            'eventCategory.event',
        ])
            ->where('user_id', auth()->id())
            ->where('status', 'approved')
            ->get();

        return Inertia::render(
            'run-submissions/Index',
            [
                'registrations' => $registrations,
            ]
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'distance' => [
                'required',
                'numeric',
                'min:0.1',
            ],

            'photo' => [
                'required',
                'image',
                'max:5120',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $path = $request
            ->file('photo')
            ->store(
                'run-submissions',
                'public'
            );

        RunSubmission::create([
            'user_id' => auth()->id(),
            'distance' => $validated['distance'],
            'photo' => $path,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return back();
    }
}
