<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
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

    /**
     * Send a transactional email to one or more users (null entries skipped).
     *
     * Delivery is synchronous, so a mailer outage must never break the request
     * the user just triggered — failures are logged and swallowed instead.
     *
     * @param  User|iterable<User|null>|null  $users
     */
    protected function email(User|iterable|null $users, Notification $notification): void
    {
        $list = $users instanceof User ? [$users] : ($users ?? []);

        foreach ($list as $user) {
            if (! $user) {
                continue;
            }

            try {
                $user->notify($notification);
            } catch (\Throwable $e) {
                Log::warning('Transactional email failed to send.', [
                    'user_id' => $user->id ?? null,
                    'notification' => $notification::class,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
