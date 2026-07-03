<?php

namespace App\Support;

use App\Models\Registration;
use App\Models\RunSubmission;
use App\Models\Shipment;
use App\Models\User;
use App\Notifications\SystemNotification;

/**
 * Central catalogue of every transactional email the app sends.
 *
 * Each method returns a configured {@see SystemNotification}. All subject lines
 * and body copy live here (and only here) — they are built into the app and are
 * deliberately NOT editable from the admin UI. To change wording, edit this
 * file. The brand styling comes from resources/views/vendor/mail.
 */
class Emails
{
    /*
    |--------------------------------------------------------------------------
    | Account lifecycle (runner-facing)
    |--------------------------------------------------------------------------
    */

    /** The one-time code that verifies a sign-up email address. */
    public static function registrationOtp(string $firstName, string $code, int $minutes): SystemNotification
    {
        return new SystemNotification(
            subject: "{$code} is your Shift & Stride PH verification code",
            greeting: "Hi {$firstName},",
            lines: [
                'Thanks for signing up! Use the verification code below to confirm your email address and finish creating your account.',
                "**{$code}**",
                "This code expires in {$minutes} minutes. If you didn't request it, you can safely ignore this email — no account will be created.",
            ],
        );
    }

    /** A new account was created and is awaiting admin approval. */
    public static function accountRegistered(): SystemNotification
    {
        return new SystemNotification(
            subject: 'Welcome to Shift & Stride PH — your account is under review',
            lines: [
                'Thanks for creating a Shift & Stride PH account! We\'re thrilled to have you join the movement.',
                'Your account is currently being reviewed by our team. This usually happens within a day or two.',
                'We\'ll send you another email the moment your account is approved — you\'ll be able to log in and join events right away.',
            ],
        );
    }

    /** An admin approved the account; the runner can now log in. */
    public static function accountApproved(): SystemNotification
    {
        return new SystemNotification(
            subject: 'Your Shift & Stride PH account is approved',
            lines: [
                'Great news — your account has been approved and is now active.',
                'You can log in to complete your runner profile, browse events, and start logging your kilometres.',
            ],
            actionText: 'Log in to your account',
            actionUrl: route('login'),
            level: 'success',
            afterLines: [
                'Welcome aboard, and thank you for running for a cause!',
            ],
        );
    }

    /** An admin declined / suspended the account. */
    public static function accountDeclined(): SystemNotification
    {
        return new SystemNotification(
            subject: 'Update on your Shift & Stride PH account',
            lines: [
                'Thank you for your interest in Shift & Stride PH.',
                'After review, we\'re unable to activate your account at this time.',
                'If you believe this was a mistake or you\'d like more information, please reach out to our team and we\'ll be happy to help.',
            ],
            level: 'error',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Event registration (runner-facing)
    |--------------------------------------------------------------------------
    */

    /** The runner just registered for an event; it awaits admin review. */
    public static function registrationSubmitted(Registration $registration): SystemNotification
    {
        $event = self::eventName($registration);

        return new SystemNotification(
            subject: "Registration received — {$event}",
            lines: [
                "We've received your registration for {$event}.",
                'Our team will review it shortly. Once it\'s approved, you\'ll be able to start submitting your runs.',
            ],
            actionText: 'View your dashboard',
            actionUrl: route('dashboard'),
        );
    }

    /** An admin approved the runner's event registration. */
    public static function registrationApproved(Registration $registration): SystemNotification
    {
        $event = self::eventName($registration);

        return new SystemNotification(
            subject: "You're in! Registration approved — {$event}",
            lines: [
                "Your registration for {$event} has been approved.",
                'You can now log your runs toward this event\'s goal. Every kilometre counts!',
            ],
            actionText: 'Submit a run',
            actionUrl: route('run-submissions.index'),
            level: 'success',
        );
    }

    /** An admin rejected the runner's event registration. */
    public static function registrationRejected(Registration $registration, string $reason): SystemNotification
    {
        $event = self::eventName($registration);
        $eventId = $registration->eventCategory?->event_id;

        return new SystemNotification(
            subject: "Registration update — {$event}",
            lines: [
                "Unfortunately, your registration for {$event} was not approved.",
                "Reason: {$reason}",
                'You\'re welcome to review the details and register again.',
            ],
            actionText: $eventId ? 'Back to the event' : null,
            actionUrl: $eventId ? route('events.show', $eventId) : null,
            level: 'error',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Run submissions (runner-facing)
    |--------------------------------------------------------------------------
    */

    /** An admin approved a submitted run and credited the distance. */
    public static function runApproved(RunSubmission $submission, string $boardUrl): SystemNotification
    {
        $km = number_format((float) $submission->distance, 2);

        return new SystemNotification(
            subject: "Run approved — {$km} km credited",
            lines: [
                "Your {$km} km run has been verified and credited to your event progress.",
                'Keep up the great work — check the leaderboard to see where you stand.',
            ],
            actionText: 'View your progress',
            actionUrl: $boardUrl,
            level: 'success',
        );
    }

    /** An admin rejected a submitted run. */
    public static function runRejected(RunSubmission $submission, string $reason): SystemNotification
    {
        return new SystemNotification(
            subject: 'Your run submission needs another look',
            lines: [
                'Thanks for submitting your run. Unfortunately, we couldn\'t approve this one.',
                "Reason: {$reason}",
                'Please double-check your proof and submit again — we\'re happy to review it.',
            ],
            actionText: 'Submit a new run',
            actionUrl: route('run-submissions.index'),
            level: 'error',
        );
    }

    /** The runner just entered the overall Top 20. */
    public static function reachedTopTwenty(int $rank): SystemNotification
    {
        return new SystemNotification(
            subject: "You've cracked the Top 20! 🏆",
            lines: [
                "Amazing running — you've climbed to #{$rank} on the overall leaderboard.",
                'Keep logging those kilometres to hold your spot (or climb even higher).',
            ],
            actionText: 'View the leaderboard',
            actionUrl: route('leaderboards.index'),
            level: 'success',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Teams (runner-facing)
    |--------------------------------------------------------------------------
    */

    /** The runner was invited to join a team. */
    public static function teamInvitation(string $captainName, string $teamName, string $eventName, int $eventId): SystemNotification
    {
        return new SystemNotification(
            subject: "You're invited to join \"{$teamName}\"",
            lines: [
                "{$captainName} has invited you to join their team \"{$teamName}\" for {$eventName}.",
                'Head to the event page to accept or decline the invitation.',
            ],
            actionText: 'View the invitation',
            actionUrl: route('events.show', $eventId),
        );
    }

    /** An admin approved the runner's team. */
    public static function teamApproved(string $teamName, string $eventName, ?int $eventId): SystemNotification
    {
        return new SystemNotification(
            subject: "Your team \"{$teamName}\" is approved",
            lines: [
                "Your team \"{$teamName}\" for {$eventName} has been approved.",
                'Every member can now start logging runs toward your shared goal. Go team!',
            ],
            actionText: $eventId ? 'View the event' : null,
            actionUrl: $eventId ? route('events.show', $eventId) : null,
            level: 'success',
        );
    }

    /** An admin denied the runner's team. */
    public static function teamDenied(string $teamName, string $eventName, ?int $eventId): SystemNotification
    {
        return new SystemNotification(
            subject: "Update on your team \"{$teamName}\"",
            lines: [
                "Unfortunately, your team \"{$teamName}\" for {$eventName} was not approved.",
                'You\'re welcome to join the event again or form a new team.',
            ],
            actionText: $eventId ? 'Back to the event' : null,
            actionUrl: $eventId ? route('events.show', $eventId) : null,
            level: 'error',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Certificates & shipments (runner-facing)
    |--------------------------------------------------------------------------
    */

    /** A finisher certificate has been generated and is ready to download. */
    public static function certificateReady(Registration $registration, string $eventName): SystemNotification
    {
        return new SystemNotification(
            subject: 'Your finisher certificate is ready 🎉',
            lines: [
                "Congratulations on completing {$eventName}!",
                'Your official finisher certificate is ready. Download it, print it, and share your achievement.',
            ],
            actionText: 'Download your certificate',
            actionUrl: route('certificates.download', $registration),
            level: 'success',
        );
    }

    /** A shipment status changed (preparing / shipped / delivered). */
    public static function shipmentUpdate(Shipment $shipment, string $status): SystemNotification
    {
        $ref = "{$shipment->item} (#{$shipment->tracking_id})";

        $copy = match ($status) {
            'preparing' => [
                'subject' => "We're preparing your {$shipment->item}",
                'lines' => ["Good news — your {$ref} is being prepared for shipping.", 'We\'ll let you know as soon as it\'s on the way.'],
                'level' => '',
            ],
            'shipped' => [
                'subject' => "Your {$shipment->item} is on the way",
                'lines' => array_values(array_filter([
                    "Your {$ref} has been shipped".($shipment->courier ? " via {$shipment->courier}." : '.'),
                    'Keep an eye out for its arrival!',
                ])),
                'level' => 'success',
            ],
            'delivered' => [
                'subject' => "Your {$shipment->item} has been delivered",
                'lines' => ["Your {$ref} has been marked as delivered.", 'We hope you love it — enjoy, and happy running!'],
                'level' => 'success',
            ],
            default => [
                'subject' => "Shipment update — {$shipment->item}",
                'lines' => ["The status of your {$ref} is now: {$status}."],
                'level' => '',
            ],
        };

        return new SystemNotification(
            subject: $copy['subject'],
            lines: $copy['lines'],
            actionText: 'View your shipments',
            actionUrl: route('shipments.index'),
            level: $copy['level'],
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Admin-facing alerts
    |--------------------------------------------------------------------------
    */

    /** A new account was registered and needs admin approval. */
    public static function adminNewUser(User $user): SystemNotification
    {
        return new SystemNotification(
            subject: 'New account awaiting approval',
            lines: [
                'A new runner has signed up and is waiting for approval:',
                "{$user->full_name} ({$user->email})",
            ],
            actionText: 'Review accounts',
            actionUrl: route('admin.users.index'),
        );
    }

    /** A new event registration was submitted for review. */
    public static function adminNewRegistration(User $runner, string $eventName): SystemNotification
    {
        return new SystemNotification(
            subject: 'New event registration to review',
            lines: [
                "{$runner->full_name} has registered for {$eventName} and is awaiting approval.",
            ],
            actionText: 'Review registrations',
            actionUrl: route('admin.registrations.index'),
        );
    }

    /** A new team was created and needs admin approval. */
    public static function adminNewTeam(User $captain, string $teamName, string $eventName): SystemNotification
    {
        return new SystemNotification(
            subject: 'New team awaiting approval',
            lines: [
                "{$captain->full_name} created the team \"{$teamName}\" for {$eventName}.",
                'It\'s ready for your review once the roster is set.',
            ],
            actionText: 'Review registrations',
            actionUrl: route('admin.registrations.index'),
        );
    }

    /** A new run was submitted and needs admin verification. */
    public static function adminNewRun(User $runner, float $distance): SystemNotification
    {
        $km = number_format($distance, 2);

        return new SystemNotification(
            subject: 'New run submission to review',
            lines: [
                "{$runner->full_name} submitted a {$km} km run for verification.",
            ],
            actionText: 'Review run submissions',
            actionUrl: route('admin.run-submissions.index'),
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private static function eventName(Registration $registration): string
    {
        return $registration->eventCategory?->event?->name ?? 'the event';
    }
}
