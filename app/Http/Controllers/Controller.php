<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\AppNotification;
use Inertia\Inertia;

abstract class Controller
{
    /**
     * Flash a toast message that the frontend picks up via the `flash` event.
     */
    protected function toast(string $message, string $type = 'success'): void
    {
        Inertia::flash('toast', [
            'type' => $type,
            'message' => $message,
        ]);
    }

    /**
     * Send an in-app notification to one or more users (null entries skipped).
     *
     * @param  User|iterable<User|null>|null  $users
     */
    protected function notifyUsers(
        User|iterable|null $users,
        string $title,
        string $body,
        ?string $url = null,
        string $category = 'info',
    ): void {
        $list = $users instanceof User ? [$users] : ($users ?? []);

        foreach ($list as $user) {
            $user?->notify(new AppNotification($title, $body, $url, $category));
        }
    }

    /** Every admin user (recipients for approval-queue notifications). */
    protected function admins()
    {
        return User::where('role', 'admin')->get();
    }
}
