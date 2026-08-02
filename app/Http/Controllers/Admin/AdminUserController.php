<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Models\Shipment;
use App\Models\User;
use App\Support\Emails;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $filter = $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        $counts = User::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $users = User::query()
            ->when(
                in_array($filter, ['pending', 'active', 'suspended'], true),
                fn ($query) => $query->where('status', $filter),
            )
            ->when($search !== '', fn ($query) => $query->where(
                fn ($q) => $q
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"])
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('runner_code', 'like', "%{$search}%"),
            ))
            ->latest()
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'counts' => [
                'all' => (int) $counts->sum(),
                'pending' => (int) ($counts['pending'] ?? 0),
                'active' => (int) ($counts['active'] ?? 0),
                'suspended' => (int) ($counts['suspended'] ?? 0),
            ],
            'filter' => $filter,
            'search' => $search,
        ]);
    }

    /**
     * Full admin profile for one runner: their joined events, run submissions
     * and shipments in one place.
     */
    public function show(User $user)
    {
        $user->load([
            'registrations.eventCategory.event',
            'runSubmissions.registrations.eventCategory.event',
            'shipments',
        ]);

        return Inertia::render('admin/users/Show', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'initials' => $user->initials,
                'email' => $user->email,
                'runner_code' => $user->runner_code,
                'profile_photo' => $user->profile_photo,
                'status' => $user->status,
                'role' => $user->role,
                'verified' => $user->verified,
                'gender' => $user->gender,
                'birthday' => $user->birthday?->format('M d, Y'),
                'age' => $user->age,
                'province' => $user->province,
                'city' => $user->city,
                'island' => $user->island,
                'address' => $user->address,
                'created_at' => $user->created_at?->format('M d, Y'),
            ],

            'registrations' => $user->registrations->map(fn (Registration $r) => [
                'id' => $r->id,
                'event_name' => $r->eventCategory?->event?->name,
                'category_name' => $r->eventCategory?->name,
                'target_km' => (float) ($r->eventCategory?->target_km ?? 0),
                'completed_km' => (float) $r->completed_km,
                'bib_number' => $r->bib_number,
                'status' => $r->status,
                'joined_at' => $r->created_at?->format('M d, Y'),
            ])->values(),

            'runs' => $user->runSubmissions
                ->sortByDesc('created_at')
                ->map(fn (RunSubmission $run) => [
                    'id' => $run->id,
                    'distance' => (float) $run->distance,
                    'status' => $run->status,
                    'ran_on' => $run->run_date?->format('M d, Y'),
                    'submitted_at' => $run->created_at?->format('M d, Y'),
                    'notes' => $run->notes,
                    'photo_url' => $run->photo ? "/storage/{$run->photo}" : null,
                    'proof_link' => $run->proof_link,
                    'events' => $run->registrations
                        ->map(fn ($r) => $r->eventCategory?->event?->name)
                        ->filter()
                        ->unique()
                        ->values(),
                ])->values(),

            'shipments' => $user->shipments->map(fn (Shipment $s) => [
                'id' => $s->id,
                'tracking_id' => $s->tracking_id,
                'item' => $s->item,
                'courier' => $s->courier,
                'status' => $s->status,
                'shipped_at' => $s->shipped_at?->format('M d, Y'),
                'delivered_at' => $s->delivered_at?->format('M d, Y'),
            ])->values(),
        ]);
    }

    public function approve(User $user)
    {
        $user->update([
            'status' => 'active',
        ]);

        $this->email($user, Emails::accountApproved());

        $this->notifyUsers(
            $user,
            'Account approved',
            'Welcome aboard! Your account is now active — explore events and start running.',
            route('dashboard'),
            'approval',
        );

        $this->toast('User approved.');

        return back();
    }

    public function deny(User $user)
    {
        $user->update([
            'status' => 'suspended',
        ]);

        $this->email($user, Emails::accountDeclined());

        $this->toast('Account suspended.');

        return back();
    }

    /**
     * Permanently delete a user entered incorrectly.
     *
     * Cascades remove their registrations, run submissions, shipments and
     * certificates. Admins cannot delete their own account (to avoid locking
     * themselves out) nor another admin (a safety rail against wiping staff).
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            $this->toast('You cannot delete your own account.', 'error');

            return back();
        }

        if ($user->role === 'admin') {
            $this->toast('Admin accounts cannot be deleted here.', 'error');

            return back();
        }

        $user->delete();

        $this->toast('User deleted.');

        return back();
    }
}
