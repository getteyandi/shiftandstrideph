<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\UserApprovedNotification;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $filter = $request->query('status', 'all');

        $counts = User::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $users = User::query()
            ->when(
                in_array($filter, ['pending', 'active', 'suspended'], true),
                fn ($query) => $query->where('status', $filter),
            )
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
        ]);
    }

    public function approve(User $user)
    {
        $user->update([
            'status' => 'active',
        ]);

        $user->notify(
            new UserApprovedNotification()
        );

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

        $this->toast('Account suspended.');

        return back();
    }
}
