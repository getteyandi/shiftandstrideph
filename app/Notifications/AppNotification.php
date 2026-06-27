<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * A single, generic in-app (database) notification used across the app for
 * invitations, approvals, registrations, and run reviews. It is intentionally
 * NOT queued so the row is written immediately and shows up on the next page
 * load — no queue worker required.
 */
class AppNotification extends Notification
{
    /**
     * @param  string  $category  one of: invite, approval, rejection, registration, info
     */
    public function __construct(
        public string $title,
        public string $body,
        public ?string $url = null,
        public string $category = 'info',
        public ?string $icon = null,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'url' => $this->url,
            'category' => $this->category,
            'icon' => $this->icon,
        ];
    }
}
