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
        ])
            ->when(
                in_array($filter, ['pending', 'approved', 'rejected', 'completed'], true),
                fn ($query) => $query->where('status', $filter),
            )
            ->latest()
            ->paginate(8)
            ->withQueryString();

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

        $this->toast('Registration rejected.');

        return back();
    }
}
