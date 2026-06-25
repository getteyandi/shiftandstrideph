<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Notifications\RegistrationApprovedNotification;
use App\Notifications\UserApprovedNotification;
use Inertia\Inertia;

class AdminRegistrationController extends Controller
{
    public function index()
    {
        return Inertia::render(
            'admin/registrations/Index',
            [
                'registrations' => Registration::with([
                    'user',
                    'eventCategory.event',
                ])->latest()->get(),
            ]
        );
    }

    public function approve(
        Registration $registration
    ) {
        dd('approve method reached');
        $registration->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return back();
    }
}
