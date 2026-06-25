<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RunApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Run Approved')
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line('Your submitted run has been approved.')
            ->line('Your progress has been updated.')
            ->action(
                'View Dashboard',
                url('/dashboard')
            );
    }
}
