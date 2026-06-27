<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Registration;
use App\Models\RunSubmission;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EventBoardController extends Controller
{
    public function show(Event $event)
    {
        $event->load(['categories.registrations.user']);

        $user = Auth::user();
        $isAdmin = $user->role === 'admin';
        $preset = $event->preset;

        $myRegistration = Registration::with(['eventCategory', 'group'])
            ->where('user_id', $user->id)
            ->whereIn('event_category_id', $event->categories->pluck('id'))
            ->first();

        $eventPayload = [
            'id' => $event->id,
            'name' => $event->name,
            'banner' => $event->banner,
            'location' => $event->location,
            'status' => ucfirst($event->status),
            'preset' => $preset,
            'description' => $event->description,
            'dates' => sprintf(
                '%s - %s',
                $event->start_date->format('M j'),
                $event->end_date->format('M j, Y'),
            ),
        ];

        // Every active participant entry.
        $entries = $event->categories->flatMap(
            fn ($category) => $category->registrations
                ->whereIn('status', ['approved', 'completed'])
                ->map(fn (Registration $r) => [
                    'user_id' => $r->user_id,
                    'name' => $r->user?->full_name,
                    'initials' => $r->user?->initials,
                    'photo' => $r->user?->profile_photo,
                    'island' => $r->user?->island,
                    'category' => $category->name,
                    'km' => round((float) $r->completed_km, 2),
                    'target' => (float) $category->target_km,
                ])
        )->values();

        // -------------------------------------------------- COMMUNITY (full)
        if ($preset === 'community') {
            return Inertia::render('events/board', array_merge([
                'mode' => 'community',
                'event' => $eventPayload,
            ], $this->communityData($entries)));
        }

        // ------------------------------------------------------------- SOLO
        if ($preset === 'solo') {
            if ($isAdmin) {
                return Inertia::render('events/board', [
                    'mode' => 'solo-admin',
                    'event' => $eventPayload,
                    'participants' => $entries
                        ->sortByDesc('km')
                        ->values()
                        ->map(fn ($e) => array_merge($e, [
                            'pct' => $e['target'] > 0
                                ? min(100, round($e['km'] / $e['target'] * 100, 1))
                                : 0,
                        ])),
                ]);
            }

            return Inertia::render('events/board', [
                'mode' => 'solo',
                'event' => $eventPayload,
                'myProgress' => $this->myProgress($myRegistration),
                'mySubmissions' => $this->mySubmissions($user->id, $myRegistration),
            ]);
        }

        // ------------------------------------------------------------ GROUP
        if ($isAdmin) {
            return Inertia::render('events/board', [
                'mode' => 'group-admin',
                'event' => $eventPayload,
                'groups' => $this->groupStandings($event),
            ]);
        }

        $myGroup = $myRegistration?->group;
        $members = collect();
        $groupProgress = null;

        if ($myGroup) {
            $myGroup->loadMissing('registrations.user', 'registrations.eventCategory');
            $approved = $myGroup->registrations
                ->whereIn('status', ['approved', 'completed']);

            $members = $approved
                ->map(fn (Registration $r) => [
                    'user_id' => $r->user_id,
                    'name' => $r->user?->full_name,
                    'initials' => $r->user?->initials,
                    'photo' => $r->user?->profile_photo,
                    'category' => $r->eventCategory?->name,
                    'km' => round((float) $r->completed_km, 2),
                    'target' => (float) ($r->eventCategory?->target_km ?? 0),
                ])
                ->sortByDesc('km')
                ->values()
                ->map(fn ($m, $i) => array_merge($m, ['rank' => $i + 1]));

            // One shared team goal (the event's category distance). Members
            // combine their distance to finish that single goal together.
            $gTarget = (float) $members->max('target');
            $gDone = min((float) $members->sum('km'), $gTarget);
            $groupProgress = [
                'name' => $myGroup->name,
                'type' => $myGroup->type,
                'target_km' => round($gTarget, 2),
                'done_km' => round($gDone, 2),
                'remaining_km' => round(max(0, $gTarget - $gDone), 2),
                'pct' => $gTarget > 0 ? min(100, round($gDone / $gTarget * 100, 1)) : 0,
            ];
        }

        return Inertia::render('events/board', [
            'mode' => 'group',
            'event' => $eventPayload,
            'groupProgress' => $groupProgress,
            'members' => $members,
            'mySubmissions' => $this->mySubmissions($user->id, $myRegistration),
        ]);
    }

    /* --------------------------------------------------------------- helpers */

    private function communityData($entries): array
    {
        $targetKm = (float) $entries->sum('target');
        $doneKm = (float) $entries->sum('km');
        $pct = $targetKm > 0 ? min(100, round($doneKm / $targetKm * 100, 1)) : 0;

        $ranking = $entries->sortByDesc('km')->values()->take(20)
            ->map(fn ($e, $i) => array_merge($e, ['rank' => $i + 1]));

        $islands = collect(['Luzon', 'Visayas', 'Mindanao'])->map(function ($island) use ($entries) {
            $group = $entries->where('island', $island)->sortByDesc('km')->values();

            return [
                'name' => $island,
                'total_km' => round((float) $group->sum('km'), 2),
                'participants' => $group->count(),
                'runners' => $group->take(5)
                    ->map(fn ($e, $i) => array_merge($e, ['rank' => $i + 1]))
                    ->values(),
            ];
        });

        return [
            'progress' => [
                'target_km' => round($targetKm, 2),
                'done_km' => round($doneKm, 2),
                'remaining_km' => round(max(0, $targetKm - $doneKm), 2),
                'pct' => $pct,
                'participants' => $entries->count(),
            ],
            'ranking' => $ranking,
            'islands' => $islands,
        ];
    }

    private function myProgress(?Registration $reg): ?array
    {
        if (! $reg) {
            return null;
        }

        $target = (float) ($reg->eventCategory?->target_km ?? 0);
        $done = (float) $reg->completed_km;

        return [
            'category' => $reg->eventCategory?->name,
            'status' => $reg->status,
            'target_km' => round($target, 2),
            'done_km' => round($done, 2),
            'remaining_km' => round(max(0, $target - $done), 2),
            'pct' => $target > 0 ? min(100, round($done / $target * 100, 1)) : 0,
        ];
    }

    private function mySubmissions(int $userId, ?Registration $reg)
    {
        if (! $reg) {
            return collect();
        }

        return RunSubmission::whereHas(
            'registrations',
            fn ($q) => $q->where('registrations.id', $reg->id),
        )
            ->where('user_id', $userId)
            ->latest()
            ->take(8)
            ->get()
            ->map(fn (RunSubmission $s) => [
                'id' => $s->id,
                'distance' => (float) $s->distance,
                'status' => $s->status,
                'date' => $s->created_at?->format('M j, Y'),
                'photo_url' => $s->photo ? "/storage/{$s->photo}" : null,
                'proof_link' => $s->proof_link,
            ]);
    }

    private function groupStandings(Event $event)
    {
        return $event->groups()
            ->with(['registrations.user', 'registrations.eventCategory', 'invitations.user'])
            ->get()
            ->map(function ($g) {
                $pendingInvites = $g->invitations
                    ->where('status', 'pending')
                    ->map(fn ($inv) => $inv->user?->full_name)
                    ->filter()
                    ->values();

                // The team shares one goal (the category distance); members
                // combine their distance to finish it together.
                $active = $g->registrations->whereIn('status', ['approved', 'completed']);
                $totalTarget = (float) $active
                    ->max(fn ($r) => (float) ($r->eventCategory?->target_km ?? 0));
                $totalKm = min((float) $active->sum('completed_km'), $totalTarget);

                return [
                    'id' => $g->id,
                    'name' => $g->name,
                    'type' => $g->type,
                    'status' => $g->status,
                    'total_km' => round($totalKm, 2),
                    'target_km' => round($totalTarget, 2),
                    'pct' => $totalTarget > 0
                        ? min(100, round($totalKm / $totalTarget * 100, 1))
                        : 0,
                    // Members who have joined (captain + everyone who accepted).
                    'members' => $g->registrations
                        ->map(fn ($r) => [
                            'name' => $r->user?->full_name,
                            'initials' => $r->user?->initials,
                            'is_captain' => $r->user_id === $g->created_by,
                            'status' => $r->status,
                        ])
                        ->filter(fn ($m) => $m['name'])
                        ->values(),
                    // Runners invited but who haven't responded yet.
                    'pending_invites' => $pendingInvites,
                    // True once every invited runner has accepted.
                    'all_accepted' => $pendingInvites->isEmpty(),
                ];
            })
            ->sortByDesc('total_km')
            ->values()
            ->map(fn ($g, $i) => array_merge($g, ['rank' => $i + 1]));
    }
}
