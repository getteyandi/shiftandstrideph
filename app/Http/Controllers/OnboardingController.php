<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function create()
    {
        $user = Auth::user();

        // Already complete (or admin)? Send them home.
        if (
            $user->role === 'admin' ||
            ($user->birthday && $user->gender && $user->province
                && $user->city && $user->island && $user->address
                && $user->profile_photo)
        ) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding', [
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ],
            'genders' => ['Male', 'Female', 'Prefer not to say'],
            'islands' => ['Luzon', 'Visayas', 'Mindanao'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'birthday' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:Male,Female,Prefer not to say'],
            'province' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'island' => ['required', 'in:Luzon,Visayas,Mindanao'],
            'address' => ['required', 'string', 'max:500'],
            'profile_photo' => ['required', 'image', 'max:5120'],
        ]);

        $user = $request->user();

        $validated['profile_photo'] = $request
            ->file('profile_photo')
            ->store('profile-photos', 'public');

        // Issue a runner code on first completion if they don't have one yet.
        if (! $user->runner_code) {
            $validated['runner_code'] = sprintf('SSP-%06d', $user->id);
        }

        $user->update($validated);

        $this->toast('Welcome aboard! Your profile is all set.');

        return redirect()->route('dashboard');
    }
}
