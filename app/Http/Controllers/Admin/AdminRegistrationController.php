<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Notifications\RegistrationApprovedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('status', 'all');

        $counts = Registration::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $registrations = Registration::with([
            'user',
            'eventCategory.event',
            'group.registrations.user',
            'group.invitations.user',
        ])
            ->when(
                in_array($filter, ['pending', 'approved', 'rejected', 'completed'], true),
                fn ($query) => $query->where('status', $filter),
            )
            ->latest()
            ->paginate(8)
            ->withQueryString()
            ->through(fn (Registration $r) => [
                'id' => $r->id,
                'bib_number' => $r->bib_number,
                'status' => $r->status,
                'rejection_reason' => $r->rejection_reason,
                'created_at' => $r->created_at?->diffForHumans(),
                'user' => [
                    'first_name' => $r->user?->first_name,
                    'last_name' => $r->user?->last_name,
                    'email' => $r->user?->email,
                ],
                'event_category' => $r->eventCategory ? [
                    'name' => $r->eventCategory->name,
                    'target_km' => $r->eventCategory->target_km,
                    'event' => $r->eventCategory->event ? [
                        'name' => $r->eventCategory->event->name,
                        'location' => $r->eventCategory->event->location,
                        'preset' => $r->eventCategory->event->preset,
                    ] : null,
                ] : null,
                // Team context for group/duo registrations.
                'team' => $r->group ? [
                    'id' => $r->group->id,
                    'name' => $r->group->name,
                    'type' => $r->group->type,
                    'status' => $r->group->status,
                    'is_captain' => $r->user_id === $r->group->created_by,
                    'members' => $r->group->registrations->map(fn ($m) => [
                        'name' => $m->user?->full_name,
                        'is_captain' => $m->user_id === $r->group->created_by,
                        'status' => $m->status,
                    ])->filter(fn ($m) => $m['name'])->values(),
                    'pending_invites' => $r->group->invitations
                        ->where('status', 'pending')
                        ->map(fn ($inv) => $inv->user?->full_name)
                        ->filter()->values(),
                ] : null,
            ]);

        return Inertia::render('admin/registrations/Index', [
            'registrations' => $registrations,
            'counts' => [
                'all' => (int) $counts->sum(),
                'pending' => (int) ($counts['pending'] ?? 0),
                'approved' => (int) ($counts['approved'] ?? 0),
                'rejected' => (int) ($counts['rejected'] ?? 0),
                'completed' => (int) ($counts['completed'] ?? 0),
            ],
            'filter' => $filter,
        ]);
    }

    public function approve(
        Registration $registration
    ) {
        $registration->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        // Close registration if approvals filled the event's quota.
        $registration->loadMissing('eventCategory.event');
        $registration->eventCategory?->event?->closeIfQuotaReached();

        $registration->user->notify(
            new RegistrationApprovedNotification()
        );

        $registration->loadMissing('eventCategory.event');
        $eventName = $registration->eventCategory?->event?->name ?? 'the event';
        $this->notifyUsers(
            $registration->user,
            'Registration approved',
            "Your registration for {$eventName} was approved. You can start submitting runs!",
            route('events.index'),
            'approval',
        );

        $this->toast('Registration approved.');

        return back();
    }

    public function reject(
        Request $request,
        Registration $registration
    ) {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        $registration->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'approved_at' => null,
        ]);

        $registration->loadMissing('eventCategory.event');
        $eventName = $registration->eventCategory?->event?->name ?? 'the event';
        $this->notifyUsers(
            $registration->user,
            'Registration rejected',
            "Your registration for {$eventName} was rejected: {$validated['rejection_reason']}. You can join again.",
            route('events.show', $registration->eventCategory->event_id),
            'rejection',
        );

        $this->toast('Registration rejected.');

        return back();
    }
}
