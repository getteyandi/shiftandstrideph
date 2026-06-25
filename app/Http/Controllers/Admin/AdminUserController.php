<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\UserApprovedNotification;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index()
    {
        return Inertia::render(
            'admin/users/Index',
            [
                'users' => User::latest()->get(),
            ]
        );
    }

    public function approve(User $user)
    {
        $user->update([
            'status' => 'approved',
        ]);

        $user->notify(
            new UserApprovedNotification()
        );

        return back();
    }
}
