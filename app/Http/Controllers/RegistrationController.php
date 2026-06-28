<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventGroup;
use App\Models\GroupInvitation;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $filter = $request->query('filter', 'active');

        $statusMap = [
            'active' => ['open', 'upcoming'],
            'open' => ['open'],
            'upcoming' => ['upcoming'],
            'past' => ['closed', 'completed'],
        ];

        $map = fn (Event $event) => [
            'id' => $event->id,
            'name' => $event->name,
            'location' => $event->location,
            'description' => $event->description,
            'dates' => sprintf(
                '%s - %s',
                $event->start_date->format('M j'),
                $event->end_date->format('M j, Y'),
            ),
            'status' => ucfirst($event->status),
            'is_highlighted' => (bool) $event->is_highlighted,
            'preset' => $event->preset,
            'joined_count' => $event->categories
                ->sum(fn ($category) => $category->registrations()->count()),
            'categories' => $event->categories->pluck('name')->values(),
            'banner' => $event->banner,
        ];

        $base = Event::with([
            'categories' => fn ($query) => $query->orderBy('sort_order'),
        ])
            ->where('is_published', true)
            ->when(
                isset($statusMap[$filter]),
                fn ($query) => $query->whereIn('status', $statusMap[$filter]),
            )
            ->orderByDesc('start_date');

        // Every featured (highlighted) event, others paginated below.
        $highlightedModels = (clone $base)->where('is_highlighted', true)->get();
        $highlighted = $highlightedModels->map($map)->values();

        $events = (clone $base)
            ->when(
                $highlightedModels->isNotEmpty(),
                fn ($query) => $query->whereNotIn('id', $highlightedModels->pluck('id')),
            )
            ->paginate(6)
            ->withQueryString()
            ->through($map);

        // The runner's own join history rendered with the dashboard event cards.
        $joinedEvents = Registration::with([
            'eventCategory.event',
            'group.registrations.eventCategory',
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(6, ['*'], 'joined')
            ->withQueryString()
            ->through(function (Registration $registration) {
                $event = $registration->eventCategory?->event;
                $group = $registration->group;

                // Group/duo events share one combined goal (matches the board).
                if ($event?->preset === 'group' && $group) {
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
                    $targetKm = (float) ($registration->eventCategory?->target_km ?? 0);
                }

                return [
                    'id' => $registration->id,
                    'event_id' => $event?->id,
                    'event_name' => $event?->name,
                    'banner' => $event?->banner,
                    'is_highlighted' => (bool) $event?->is_highlighted,
                    'preset' => $event?->preset,
                    'category_name' => $registration->eventCategory?->name,
                    'bib_number' => $registration->bib_number,
                    'distance_done' => $distanceDone,
                    'target_km' => $targetKm,
                    'activity_count' => $registration->activity_count,
                    'last_activity_at' => optional($registration->last_activity_at)
                        ?->format('M d') ?? '—',
                    'ranking_enabled' => (bool) $registration->eventCategory?->ranking_enabled,
                    'rank' => null,
                    'status' => $registration->status,
                    'joined_at' => $registration->created_at?->format('M j, Y'),
                ];
            });

        return Inertia::render('events/Index', [
            'highlighted' => $highlighted,
            'events' => $events,
            'joinedEvents' => $joinedEvents,
            'filter' => $filter,
        ]);
    }

    public function show(Event $event)
    {
        $user = Auth::user();

        $event->load([
            'categories' => fn($query) => $query->orderBy('sort_order'),
        ]);

        $myRegistration = Registration::where('user_id', $user->id)
            ->whereIn('event_category_id', $event->categories->pluck('id'))
            ->first();

        // The runner's run submissions for this event (task: view per event).
        $mySubmissions = $myRegistration
            ? RunSubmission::whereHas(
                'registrations',
                fn ($q) => $q->where('registrations.id', $myRegistration->id),
            )
                ->where('user_id', $user->id)
                ->latest()
                ->get()
                ->map(fn (RunSubmission $s) => [
                    'id' => $s->id,
                    'distance' => (float) $s->distance,
                    'status' => $s->status,
                    'date' => $s->created_at?->format('M j, Y'),
                    'photo_url' => $s->photo ? "/storage/{$s->photo}" : null,
                    'proof_link' => $s->proof_link,
                    'rejection_reason' => $s->rejection_reason,
                ])
            : collect();

        $isGroupEvent = $event->preset === 'group';
        $eventCatIds = $event->categories->pluck('id');

        // Standings — only approved teams compete on the public board.
        $groups = $isGroupEvent
            ? $event->groups()
                ->where('status', 'approved')
                ->with('registrations.user')
                ->latest()
                ->get()
                ->map(fn (EventGroup $g) => [
                    'id' => $g->id,
                    'name' => $g->name,
                    'type' => $g->type,
                    'status' => $g->status,
                    'total_km' => round((float) $g->registrations->sum('completed_km'), 2),
                    'members' => $g->registrations
                        ->map(fn ($r) => $r->user?->full_name)
                        ->filter()
                        ->values(),
                ])
                ->values()
            : collect();

        // The runner's own team (with captain tools).
        $myGroup = $myRegistration?->group;
        $myTeam = null;
        $inviteCandidates = collect();

        if ($myGroup) {
            $myGroup->loadMissing('registrations.user', 'invitations.user');
            $isCaptain = $myGroup->isCaptain($user->id);

            $myTeam = [
                'id' => $myGroup->id,
                'name' => $myGroup->name,
                'type' => $myGroup->type,
                'status' => $myGroup->status,
                'max' => $myGroup->maxMembers(),
                'is_captain' => $isCaptain,
                'members' => $myGroup->registrations->map(fn ($r) => [
                    'name' => $r->user?->full_name,
                    'initials' => $r->user?->initials,
                    'photo' => $r->user?->profile_photo,
                    'is_captain' => $r->user_id === $myGroup->created_by,
                ])->values(),
                'invitations' => $isCaptain
                    ? $myGroup->invitations->where('status', 'pending')->map(fn ($inv) => [
                        'id' => $inv->id,
                        'name' => $inv->user?->full_name,
                    ])->values()
                    : collect(),
            ];

            if ($isCaptain && $myGroup->status === 'pending') {
                $invitedIds = GroupInvitation::where('status', 'pending')
                    ->whereHas('group', fn ($q) => $q->where('event_id', $event->id))
                    ->pluck('user_id');

                $inEventIds = Registration::whereIn('event_category_id', $eventCatIds)
                    ->pluck('user_id');

                $inviteCandidates = User::where('role', 'participant')
                    ->whereNotIn('id', $inEventIds)
                    ->whereNotIn('id', $invitedIds)
                    ->orderBy('first_name')
                    ->get()
                    ->map(fn (User $u) => [
                        'id' => $u->id,
                        'name' => $u->full_name,
                        'runner_code' => $u->runner_code,
                    ]);
            }
        }

        // Pending team invitations to this runner for this event.
        $myInvitations = $isGroupEvent
            ? GroupInvitation::where('user_id', $user->id)
                ->where('status', 'pending')
                ->whereHas('group', fn ($q) => $q->where('event_id', $event->id))
                ->with(['group.creator'])
                ->get()
                ->map(fn (GroupInvitation $inv) => [
                    'id' => $inv->id,
                    'group_name' => $inv->group?->name,
                    'type' => $inv->group?->type,
                    'captain' => $inv->group?->creator?->full_name,
                ])
            : collect();

        return Inertia::render('events/show', [

            'myRegistration' => $myRegistration ? [
                'id' => $myRegistration->id,
                'category_id' => $myRegistration->event_category_id,
                'status' => $myRegistration->status,
                'rejection_reason' => $myRegistration->rejection_reason,
                'bib_number' => $myRegistration->bib_number,
                'completed_km' => (float) $myRegistration->completed_km,
                'group' => $myGroup ? [
                    'name' => $myGroup->name,
                    'type' => $myGroup->type,
                ] : null,
            ] : null,

            'mySubmissions' => $mySubmissions,

            'groups' => $groups,

            'myTeam' => $myTeam,

            'inviteCandidates' => $inviteCandidates,

            'myInvitations' => $myInvitations,

            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'banner' => $event->banner,
                'location' => $event->location,
                'preset' => $event->preset,
                'dates' => sprintf(
                    '%s - %s',
                    $event->start_date->format('M j'),
                    $event->end_date->format('M j, Y'),
                ),
                'status' => ucfirst($event->status),
                'categories' => $event->categories->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'target_km' => $category->target_km,
                    'ranking_enabled' => $category->ranking_enabled,
                ]),
            ],

        ]);
    }

    public function store(Request $request, Event $event)
    {
        $user = Auth::user();

        $isGroup = $event->preset === 'group';

        $validated = $request->validate([
            'event_category_id' => [
                'required',
                Rule::exists('event_categories', 'id')
                    ->where('event_id', $event->id),
            ],
            'group_name' => [$isGroup ? 'required' : 'nullable', 'string', 'max:255'],
            'group_type' => [$isGroup ? 'required' : 'nullable', 'in:solo,duo,group'],
        ]);

        // Can't join a closed/completed (history) event.
        if ($event->isHistory()) {
            $this->toast('Registration for this event is closed.', 'error');

            return back();
        }

        $eventCategoryIds = $event->categories()->pluck('id');

        // Existing registrations for this user in this event.
        $existingRegs = Registration::where('user_id', $user->id)
            ->whereIn('event_category_id', $eventCategoryIds)
            ->get();

        // One category per event — block if still actively in any of them.
        if ($existingRegs->whereNotIn('status', ['rejected'])->isNotEmpty()) {
            $this->toast(
                'You can only join one category per event. Undo your current category first.',
                'error',
            );

            return back();
        }

        // Clear out rejected attempts so the runner can rejoin cleanly.
        foreach ($existingRegs as $old) {
            $oldGroup = $old->group;
            $old->delete();

            if ($oldGroup && $oldGroup->registrations()->count() === 0) {
                $oldGroup->delete();
            }
        }

        // Resolve the team for group-preset events.
        $groupId = null;
        if ($isGroup) {
            $group = $this->resolveGroup($event, $user, $validated);
            if (! $group instanceof EventGroup) {
                return $group; // a redirect with an error toast
            }
            $groupId = $group->id;
        }

        // Event-scoped, numbers-only bib.
        $bibNumber = Registration::whereIn('event_category_id', $eventCategoryIds)
            ->count() + 1;

        $registration = Registration::create([

            'user_id' => $user->id,

            'event_category_id' => $validated['event_category_id'],

            'group_id' => $groupId,

            'bib_number' => sprintf('%05d', $bibNumber),

            'status' => 'pending',

            'completed_km' => 0,

            'activity_count' => 0,

            'last_activity_at' => null,

            'approved_at' => null,

        ]);

        // Close registration if this join filled the event's quota.
        $registration->loadMissing('eventCategory.event');
        $registration->eventCategory?->event?->closeIfQuotaReached();

        $eventName = $event->name;

        // Group captains return to the event page to invite their teammates;
        // everyone else goes to their dashboard.
        if ($isGroup) {
            $this->notifyUsers(
                $this->admins(),
                'New team awaiting approval',
                "{$user->full_name} created a team for {$eventName}.",
                route('events.board', $event),
                'registration',
            );

            $this->toast('Team created! Invite your teammates below — an admin will review the team.');

            return redirect()->route('events.show', $event);
        }

        $this->notifyUsers(
            $this->admins(),
            'New registration to review',
            "{$user->full_name} joined {$eventName}.",
            route('admin.registrations.index'),
            'registration',
        );

        $this->toast('Registration submitted! An admin will review it shortly.');

        return redirect()->route('dashboard');
    }

    /**
     * Joining a group-preset event creates a team with the runner as captain
     * (pending admin approval). They invite the rest from the event page.
     *
     * @return EventGroup
     */
    private function resolveGroup(Event $event, $user, array $validated)
    {
        return EventGroup::create([
            'event_id' => $event->id,
            'name' => $validated['group_name'] ?: "{$user->first_name}'s Team",
            'type' => $validated['group_type'] ?? 'group',
            'status' => 'pending',
            'created_by' => $user->id,
        ]);
    }

    /**
     * Undo a registration (human-error recovery) as long as it isn't completed.
     */
    public function cancel(Registration $registration)
    {
        abort_unless(
            $registration->user_id === Auth::id(),
            403,
        );

        if ($registration->status === 'completed') {
            $this->toast('Completed registrations cannot be undone.', 'error');

            return back();
        }

        $group = $registration->group;

        $registration->delete();

        // Clean up an emptied team.
        if ($group && $group->registrations()->count() === 0) {
            $group->delete();
        }

        $this->toast('Registration removed. You can pick another category.');

        return back();
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
