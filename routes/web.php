<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminRegistrationController;
use App\Http\Controllers\Admin\AdminRunSubmissionController;
use App\Http\Controllers\Admin\AdminShipmentController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\EventCategoryController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\AdminGroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventBoardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\RunHistoryController;
use App\Http\Controllers\RunSubmissionController;
use App\Http\Controllers\ShipmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->group(function () {

    Route::get(
        '/admin/dashboard',
        [AdminDashboardController::class, 'index']
    )->name('admin.dashboard');

    // Events CRUD
    Route::resource('admin/events', EventController::class)
        ->names('admin.events')
        ->except(['show']);

    Route::post(
        'admin/events/{event}/publish',
        [EventController::class, 'publish']
    )->name('admin.events.publish');

    Route::post(
        'admin/events/{event}/highlight',
        [EventController::class, 'highlight']
    )->name('admin.events.highlight');

    Route::get(
        'admin/events/{event}/setup',
        [EventCategoryController::class, 'create']
    )->name('admin.events.setup');

    Route::get(
        'admin/events/{event}',
        [EventController::class, 'show']
    )->name('admin.events.show');

    // Event categories CRUD
    Route::resource('admin/event-categories', EventCategoryController::class)
        ->names('admin.event-categories')
        ->except(['show']);

    // User approvals
    Route::get(
        '/admin/users',
        [AdminUserController::class, 'index']
    )->name('admin.users.index');

    Route::patch(
        '/admin/users/{user}/approve',
        [AdminUserController::class, 'approve']
    )->name('admin.users.approve');

    Route::patch(
        '/admin/users/{user}/deny',
        [AdminUserController::class, 'deny']
    )->name('admin.users.deny');

    // Registration approvals
    Route::get(
        '/admin/registrations',
        [AdminRegistrationController::class, 'index']
    )->name('admin.registrations.index');

    Route::patch(
        '/admin/registrations/{registration}/approve',
        [AdminRegistrationController::class, 'approve']
    )->name('admin.registrations.approve');

    Route::patch(
        '/admin/registrations/{registration}/reject',
        [AdminRegistrationController::class, 'reject']
    )->name('admin.registrations.reject');

    // Run submission reviews
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

    // Shipment tracking
    Route::get(
        '/admin/shipments',
        [AdminShipmentController::class, 'index']
    )->name('admin.shipments.index');

    Route::post(
        '/admin/shipments',
        [AdminShipmentController::class, 'store']
    )->name('admin.shipments.store');

    Route::patch(
        '/admin/shipments/{shipment}',
        [AdminShipmentController::class, 'update']
    )->name('admin.shipments.update');

    Route::delete(
        '/admin/shipments/{shipment}',
        [AdminShipmentController::class, 'destroy']
    )->name('admin.shipments.destroy');

    // Group (team) approvals
    Route::patch(
        '/admin/groups/{group}/approve',
        [AdminGroupController::class, 'approve']
    )->name('admin.groups.approve');

    Route::patch(
        '/admin/groups/{group}/deny',
        [AdminGroupController::class, 'deny']
    )->name('admin.groups.deny');
});

/*
|--------------------------------------------------------------------------
| Onboarding (first login — complete profile)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get(
        '/onboarding',
        [OnboardingController::class, 'create']
    )->name('onboarding.create');

    Route::post(
        '/onboarding',
        [OnboardingController::class, 'store']
    )->name('onboarding.store');
});

/*
|--------------------------------------------------------------------------
| Participant
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {

    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    )->name('dashboard');

    // Events
    Route::get(
        '/events',
        [RegistrationController::class, 'index']
    )->name('events.index');

    Route::get(
        '/events/{event}/board',
        [EventBoardController::class, 'show']
    )->name('events.board');

    Route::get(
        '/events/{event}',
        [RegistrationController::class, 'show']
    )->name('events.show');

    Route::post(
        '/events/{event}/join',
        [RegistrationController::class, 'store']
    )->name('events.join');

    Route::post(
        '/registrations',
        [RegistrationController::class, 'store']
    )->name('registrations.store');

    Route::delete(
        '/registrations/{registration}',
        [RegistrationController::class, 'cancel']
    )->name('registrations.cancel');

    // Group teams (captain invites + invitee responses)
    Route::post(
        '/groups/{group}/invite',
        [GroupController::class, 'invite']
    )->name('groups.invite');

    Route::delete(
        '/group-invitations/{invitation}',
        [GroupController::class, 'cancelInvite']
    )->name('group-invitations.cancel');

    Route::post(
        '/group-invitations/{invitation}/accept',
        [GroupController::class, 'accept']
    )->name('group-invitations.accept');

    Route::post(
        '/group-invitations/{invitation}/decline',
        [GroupController::class, 'decline']
    )->name('group-invitations.decline');

    Route::get('/pending-approval', function () {
        return Inertia::render('auth/pending-approval');
    })->name('pending-approval');

    // Run submissions
    Route::get(
        '/run-submissions',
        [RunSubmissionController::class, 'index']
    )->name('run-submissions.index');

    Route::post(
        '/run-submissions',
        [RunSubmissionController::class, 'store']
    )->name('run-submissions.store');

    Route::get(
        '/my-runs',
        [RunHistoryController::class, 'index']
    )->name('my-runs.index');

    Route::get(
        '/leaderboards',
        [LeaderboardController::class, 'index']
    )->name('leaderboards.index');

    Route::get(
        '/shipments',
        [ShipmentController::class, 'index']
    )->name('shipments.index');
});

/*
|--------------------------------------------------------------------------
| Notifications (shared by admin + participants)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get(
        '/notifications',
        [NotificationController::class, 'index']
    )->name('notifications.index');

    Route::post(
        '/notifications/{id}/read',
        [NotificationController::class, 'markRead']
    )->name('notifications.read');

    Route::post(
        '/notifications/read-all',
        [NotificationController::class, 'markAllRead']
    )->name('notifications.read-all');
});

require __DIR__ . '/settings.php';
