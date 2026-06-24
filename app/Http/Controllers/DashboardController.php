<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        if (Auth::user()->status !== 'approved') {

            Auth::logout();

            return redirect('/login')
                ->withErrors([
                    'email' => 'Your account is pending approval.',
                ]);
        }

        $registrations = Registration::with([
            'eventCategory.event',
            'progress',
        ])
            ->where('user_id', auth()->id())
            ->where('status', 'approved')
            ->get();

        return Inertia::render(
            'dashboard',
            [
                'registrations' => $registrations,
            ]
        );
    }
}
