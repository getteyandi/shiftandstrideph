<?php

namespace App\Http\Controllers;

use App\Models\RunSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RunHistoryController extends Controller
{
    public function index()
    {
        $runs = RunSubmission::where(
            'user_id',
            auth()->id()
        )
            ->latest()
            ->get();

        return Inertia::render(
            'run-history/Index',
            [
                'runs' => $runs,
            ]
        );
    }
}
