<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RunRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Run Rejected')
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line('Your submitted run was rejected.')
            ->line('Please review your proof and submit again.')
            ->action(
                'Submit New Run',
                url('/run-submissions')
            );
    }
}
