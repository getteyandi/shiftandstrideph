<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Event Registration Approved')
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line('Your event registration has been approved.')
            ->line('You may now submit your runs.')
            ->action('View Events', url('/events'));
    }
}
