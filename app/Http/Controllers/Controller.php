<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

abstract class Controller
{
    /**
     * Flash a toast message that the frontend picks up via the `flash` event.
     */
    protected function toast(string $message, string $type = 'success'): void
    {
        Inertia::flash('toast', [
            'type' => $type,
            'message' => $message,
        ]);
    }
}
