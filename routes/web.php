<?php

use App\Http\Controllers\Admin\AdminRegistrationController;
use App\Http\Controllers\Admin\AdminRunSubmissionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\EventCategoryController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\RunHistoryController;
use App\Http\Controllers\RunSubmissionController;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    )->name('dashboard');
    Route::resource('admin/events', EventController::class)->name('index', 'admin.events.index');
    Route::resource(
        'admin/event-categories',
        EventCategoryController::class
    );
    // MAIN EVENTS
    Route::get(
        '/events',
        [RegistrationController::class, 'index']
    )->name('events.index');
    Route::resource('events', RegistrationController::class)
        ->only(['index', 'show']);
    Route::post(
        '/events/{event}/join',
        [RegistrationController::class, 'store']
    )->name('events.join');

    // -----------------

    Route::post(
        '/registrations',
        [RegistrationController::class, 'store']
    )->name('registrations.store');

    Route::get(
        '/admin/registrations',
        [AdminRegistrationController::class, 'index']
    )->name('admin.registrations.index');

    Route::patch(
        '/admin/registrations/{registration}/approve',
        [AdminRegistrationController::class, 'approve']
    )->name('admin.registrations.approve');

    Route::get(
        '/admin/users',
        [AdminUserController::class, 'index']
    )->name('admin.users.index');

    Route::patch(
        '/admin/users/{user}/approve',
        [AdminUserController::class, 'approve']
    )->name('admin.users.approve');

    Route::get('/pending-approval', function () {
        return Inertia::render('auth/pending-approval');
    })->name('pending-approval');

    // MAIN
    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    )
        ->middleware(['auth', 'verified'])
        ->name('dashboard');

    // MAIN
    Route::get(
        '/run-submissions',
        [RunSubmissionController::class, 'index']
    )->name('run-submissions.index');

    Route::post(
        '/run-submissions',
        [RunSubmissionController::class, 'store']
    )->name('run-submissions.store');

    // MAIN
    Route::get(
        '/admin/run-submissions',
        [AdminRunSubmissionController::class, 'index']
    )->name('admin.run-submissions.index');

    Route::patch(
        '/admin/run-submissions/{runSubmission}/approve',
        [AdminRunSubmissionController::class, 'approve']
    )->name('admin.run-submissions.approve');

    Route::patch(
        '/admin/run-submissions/{runSubmission}/reject',
        [AdminRunSubmissionController::class, 'reject']
    )->name('admin.run-submissions.reject');

    Route::get(
        '/my-runs',
        [RunHistoryController::class, 'index']
    )->name('my-runs.index');

    Route::get(
        '/leaderboards',
        [LeaderboardController::class, 'index']
    )->name('leaderboards.index');
});

require __DIR__ . '/settings.php';
