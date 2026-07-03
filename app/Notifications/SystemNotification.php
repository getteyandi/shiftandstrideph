<?php

namespace App\Notifications;

use App\Support\Emails;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * A single, brand-styled transactional email used across the whole app.
 *
 * All copy lives in {@see Emails}, which builds configured
 * instances of this class. This notification is intentionally NOT queued so
 * mail is delivered in-request — no queue worker is required for it to work.
 * The branded look comes from the published mail theme in
 * resources/views/vendor/mail (see themes/default.css + html/message.blade.php).
 */
class SystemNotification extends Notification
{
    /**
     * @param  string  $subject  email subject line
     * @param  array<int, string>  $lines  paragraphs shown before the action button
     * @param  string  $level  '', 'success', or 'error' — drives the button colour
     * @param  array<int, string>  $afterLines  paragraphs shown after the action button
     * @param  string|null  $greeting  overrides the default "Hi {first_name}," salutation
     */
    public function __construct(
        public string $subject,
        public array $lines = [],
        public ?string $actionText = null,
        public ?string $actionUrl = null,
        public string $level = '',
        public array $afterLines = [],
        public ?string $greeting = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = new MailMessage;

        if (in_array($this->level, ['success', 'error'], true)) {
            $mail->level($this->level);
        }

        $greeting = $this->greeting
            ?? 'Hi '.($notifiable->first_name ?? 'there').',';

        $mail->subject($this->subject)->greeting($greeting);

        foreach ($this->lines as $line) {
            $mail->line($line);
        }

        if ($this->actionText && $this->actionUrl) {
            $mail->action($this->actionText, $this->actionUrl);
        }

        foreach ($this->afterLines as $line) {
            $mail->line($line);
        }

        return $mail->salutation('— The Shift & Stride PH Team');
    }
}
