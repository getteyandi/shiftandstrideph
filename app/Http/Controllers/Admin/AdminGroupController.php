<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventGroup;

class AdminGroupController extends Controller
{
    public function approve(EventGroup $group)
    {
        $group->update(['status' => 'approved']);

        $group->registrations()
            ->where('status', 'pending')
            ->update(['status' => 'approved', 'approved_at' => now()]);

        $this->notifyMembers(
            $group,
            'Team approved',
            "Your team \"{$group->name}\" was approved. Start logging runs!",
            'approval',
        );

        $this->toast("Team \"{$group->name}\" approved.");

        return back();
    }

    public function deny(EventGroup $group)
    {
        $group->update(['status' => 'denied']);

        $group->registrations()
            ->where('status', 'pending')
            ->update([
                'status' => 'rejected',
                'rejection_reason' => 'Team was not approved by the admin.',
            ]);

        $this->notifyMembers(
            $group,
            'Team not approved',
            "Your team \"{$group->name}\" was denied. You can join the event again.",
            'rejection',
        );

        $this->toast("Team \"{$group->name}\" denied.");

        return back();
    }

    /** Notify every member of the team (captain + accepted runners). */
    private function notifyMembers(EventGroup $group, string $title, string $body, string $category): void
    {
        $group->loadMissing('registrations.user', 'event');
        $url = $group->event ? route('events.show', $group->event_id) : null;

        $this->notifyUsers(
            $group->registrations->map(fn ($r) => $r->user)->filter(),
            $title,
            $body,
            $url,
            $category,
        );
    }
}
