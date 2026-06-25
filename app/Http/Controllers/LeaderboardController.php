<?php

namespace App\Http\Controllers;

use App\Models\EventCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index()
    {
        $categories = EventCategory::with([
            'event',
            'registrations.user',
            'registrations.progress',
        ])->get();

        return Inertia::render(
            'leaderboards/Index',
            [
                'categories' => $categories,
            ]
        );
    }
}
