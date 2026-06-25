<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Account Approved')
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line('Your Shift & Stride account has been approved.')
            ->line('You may now log in and join events.')
            ->action(
                'Login',
                url('/login')
            )
            ->line('Thank you for joining Shift & Stride!');
    }
}
