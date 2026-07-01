<?php

namespace App\Http\Controllers;

use App\Models\EventGroup;
use App\Models\GroupInvitation;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    /** Captain invites a runner to their team. */
    public function invite(Request $request, EventGroup $group)
    {
        $user = Auth::user();
        abort_unless($group->isCaptain($user->id), 403);

        if ($group->status !== 'pending') {
            $this->toast('This team has already been reviewed.', 'error');

            return back();
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $group->loadMissing('event.categories');
        $eventCatIds = $group->event->categories->pluck('id');

        if (! $group->hasOpenSlot()) {
            $this->toast('Your team is already full.', 'error');

            return back();
        }

        $invitee = User::find($validated['user_id']);

        if ($invitee->id === $user->id) {
            $this->toast('You are already the captain.', 'error');

            return back();
        }

        $inEvent = Registration::where('user_id', $invitee->id)
            ->whereIn('event_category_id', $eventCatIds)
            ->exists();

        $invited = GroupInvitation::where('user_id', $invitee->id)
            ->where('status', 'pending')
            ->whereHas('group', fn ($q) => $q->where('event_id', $group->event_id))
            ->exists();

        if ($inEvent || $invited) {
            $this->toast('That runner is already in this event or invited.', 'error');

            return back();
        }

        GroupInvitation::create([
            'group_id' => $group->id,
            'user_id' => $invitee->id,
            'invited_by' => $user->id,
            'status' => 'pending',
        ]);

        $this->notifyUsers(
            $invitee,
            'Team invitation',
            "{$user->full_name} invited you to join \"{$group->name}\" for {$group->event->name}.",
            route('events.show', $group->event_id),
            'invite',
        );

        $this->toast('Invitation sent.');

        return back();
    }

    /** Captain cancels a pending invitation. */
    public function cancelInvite(GroupInvitation $invitation)
    {
        abort_unless($invitation->group->isCaptain(Auth::id()), 403);

        $invitation->delete();

        $this->toast('Invitation cancelled.');

        return back();
    }

    /** Invited runner accepts and joins the team (inherits the captain's category). */
    public function accept(GroupInvitation $invitation)
    {
        $user = Auth::user();
        abort_unless($invitation->user_id === $user->id, 403);

        if ($invitation->status !== 'pending') {
            $this->toast('This invitation is no longer available.', 'error');

            return back();
        }

        $group = $invitation->group;
        $event = $group->event;
        $eventCatIds = $event->categories()->pluck('id');

        if (
            Registration::where('user_id', $user->id)
                ->whereIn('event_category_id', $eventCatIds)
                ->exists()
        ) {
            $this->toast('You are already in this event.', 'error');

            return back();
        }

        $max = $group->maxMembers();
        if ($max !== null && $group->registrations()->count() >= $max) {
            $this->toast('That team is now full.', 'error');

            return back();
        }

        // Teammates join the captain's category (fallback: the event's first).
        $categoryId = Registration::where('user_id', $group->created_by)
            ->whereIn('event_category_id', $eventCatIds)
            ->value('event_category_id')
            ?? $event->categories()->value('id');

        if (! $categoryId) {
            $this->toast('This event has no categories yet.', 'error');

            return back();
        }

        $bib = Registration::whereIn('event_category_id', $eventCatIds)->count() + 1;

        Registration::create([
            'user_id' => $user->id,
            'event_category_id' => $categoryId,
            'group_id' => $group->id,
            'bib_number' => sprintf('%05d', $bib),
            'status' => 'pending',
            'completed_km' => 0,
            'activity_count' => 0,
        ]);

        $invitation->update(['status' => 'accepted']);

        $this->notifyUsers(
            $group->creator,
            'Invitation accepted',
            "{$user->full_name} accepted your invite and joined \"{$group->name}\".",
            route('events.show', $event->id),
            'approval',
        );

        $this->toast('You joined the team! Awaiting admin approval.');

        return redirect()->route('events.show', $event->id);
    }

    /** Invited runner declines. */
    public function decline(GroupInvitation $invitation)
    {
        abort_unless($invitation->user_id === Auth::id(), 403);

        $invitation->update(['status' => 'declined']);

        $invitation->loadMissing('group.creator', 'user');
        $this->notifyUsers(
            $invitation->group?->creator,
            'Invitation declined',
            "{$invitation->user?->full_name} declined your invite to \"{$invitation->group?->name}\".",
            $invitation->group ? route('events.show', $invitation->group->event_id) : null,
            'rejection',
        );

        $this->toast('Invitation declined.');

        return back();
    }
}
