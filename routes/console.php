<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Finalise events once their end date passes: complete open-KM finishers and
// move the event to its terminal state. Runs hourly so completion follows the
// event's end date without waiting for a manual admin action.
Schedule::command('events:complete-ended')
    ->hourly()
    ->withoutOverlapping();
