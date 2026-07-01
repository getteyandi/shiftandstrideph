<?php

namespace App\Http\Controllers;

use App\Models\EventCategory;
use App\Models\Registration;
use App\Models\RunSubmission;
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
            'group.registrations.eventCategory',
        ])
            ->where('user_id', $user->id)
            ->whereIn('status', ['approved', 'completed'])
            ->get();

        // Overall contribution rank — by actual distance logged (approved runs),
        // matching the Hall of Fame leaderboard.
        $totals = RunSubmission::query()
            ->where('status', 'approved')
            ->selectRaw('user_id, SUM(distance) as total')
            ->groupBy('user_id')
            ->havingRaw('SUM(distance) > 0')
            ->orderByDesc('total')
            ->pluck('user_id')
            ->values();

        $rankIndex = $totals->search($user->id);
        $rank = $rankIndex === false ? null : $rankIndex + 1;

        // Actual total distance run (approved runs), rounded to 2 decimals.
        $totalDistance = round(
            (float) RunSubmission::where('user_id', $user->id)
                ->where('status', 'approved')
                ->sum('distance'),
            2,
        );

        // Best single-event distance and best per-event rank (top 20 only).
        $bestKm = (float) $registrations->max('completed_km');

        $bestRank = null;
        foreach ($registrations->pluck('eventCategory.event')->filter()->unique('id') as $event) {
            $catIds = EventCategory::where('event_id', $event->id)->pluck('id');

            $ranked = Registration::query()
                ->whereIn('event_category_id', $catIds)
                ->whereIn('status', ['approved', 'completed'])
                ->orderByDesc('completed_km')
                ->pluck('user_id')
                ->values();

            $pos = $ranked->search($user->id);
            if ($pos !== false) {
                $position = $pos + 1;
                if ($position <= 20) {
                    $bestRank = $bestRank === null
                        ? $position
                        : min($bestRank, $position);
                }
            }
        }

        $pendingRegistrations = Registration::with([
            'eventCategory.event',
        ])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(fn (Registration $registration) => [
                'id' => $registration->id,
                'event_name' => $registration->eventCategory?->event?->name,
                'category_name' => $registration->eventCategory?->name,
                'target_km' => (float) ($registration->eventCategory?->target_km ?? 0),
                'bib_number' => $registration->bib_number,
                'requested_at' => $registration->created_at?->format('M j, Y'),
            ]);

        return Inertia::render('dashboard', [

            'runner' => [
                'name' => "{$user->first_name} {$user->last_name}",

                'initials' =>
                strtoupper(substr($user->first_name, 0, 1))
                    . strtoupper(substr($user->last_name, 0, 1)),

                'runner_code' => $user->runner_code,

                'profile_photo' => $user->profile_photo,

                'verified' => $user->verified,

                'rank' => $rank,

                'best_km' => round($bestKm, 2),

                'best_rank' => $bestRank,

                'total_distance' => $totalDistance,

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

                $event = $registration->eventCategory->event;

                // Group/duo events share ONE goal (the category distance) and
                // mirror the live board: members combine their distance to
                // finish that single goal together.
                $group = $registration->group;
                if ($event->preset === 'group' && $group) {
                    $active = $group->registrations
                        ->whereIn('status', ['approved', 'completed']);
                    $targetKm = round((float) $active->max(
                        fn ($r) => (float) ($r->eventCategory?->target_km ?? 0)
                    ), 2);
                    $distanceDone = round(
                        min((float) $active->sum('completed_km'), $targetKm),
                        2,
                    );
                } else {
                    $distanceDone = (float) $registration->completed_km;
                    $targetKm = (float) $registration->eventCategory->target_km;
                }

                return [

                    'id' => $registration->id,

                    'event_id' => $event->id,

                    'event_name' => $event->name,

                    'banner' => $event->banner,

                    'is_highlighted' => (bool) $event->is_highlighted,

                    'preset' => $event->preset,

                    'category_name' => $registration->eventCategory->name,

                    'bib_number' => $registration->bib_number,

                    'distance_done' => $distanceDone,

                    'target_km' => $targetKm,

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

            'pendingRegistrations' => $pendingRegistrations,

            'topContribution' => null, // TODO

        ]);
    }
}
