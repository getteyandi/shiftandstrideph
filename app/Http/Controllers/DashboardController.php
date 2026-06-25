<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->status !== 'active') {

            Auth::logout();

            return redirect('/login')
                ->withErrors([
                    'email' => 'Your account is pending approval.',
                ]);
        }

        $registrations = Registration::with([
            'eventCategory.event',
        ])
            ->where('user_id', $user->id)
            ->whereIn('status', ['approved', 'completed'])
            ->get();

        return Inertia::render('dashboard', [

            'runner' => [
                'name' => "{$user->first_name} {$user->last_name}",

                'initials' =>
                strtoupper(substr($user->first_name, 0, 1))
                    . strtoupper(substr($user->last_name, 0, 1)),

                'runner_code' => $user->runner_code,

                'verified' => $user->verified,

                'total_distance' => $registrations->sum('completed_km'),

                'events_completed' => $registrations
                    ->where('status', 'completed')
                    ->count(),
            ],

            'personal' => [
                [
                    'label' => 'Age',
                    'value' => optional($user->birthday)?->age,
                ],
                [
                    'label' => 'Birthday',
                    'value' => optional($user->birthday)?->format('M d, Y'),
                ],
                [
                    'label' => 'Gender',
                    'value' => $user->gender,
                ],
                [
                    'label' => 'Province',
                    'value' => $user->province,
                ],
                [
                    'label' => 'City',
                    'value' => $user->city,
                ],
            ],

            'activeRegistrations' => $registrations->map(function ($registration) {

                return [

                    'id' => $registration->id,

                    'event_name' => $registration->eventCategory->event->name,

                    'category_name' => $registration->eventCategory->name,

                    'bib_number' => $registration->bib_number,

                    'distance_done' => $registration->completed_km,

                    'target_km' => $registration->eventCategory->target_km,

                    'activity_count' => $registration->activity_count,

                    'last_activity_at' =>
                    optional($registration->last_activity_at)
                        ?->format('M d'),

                    'ranking_enabled' =>
                    $registration->eventCategory->ranking_enabled,

                    'rank' => null, // TODO

                    'status' => $registration->status,
                ];
            }),

            'topContribution' => null, // TODO

            'notifications' => [], // TODO

        ]);
    }
}
