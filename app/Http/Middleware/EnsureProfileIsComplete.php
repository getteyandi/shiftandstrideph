<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    /**
     * Redirect participants who haven't completed their profile (first login)
     * to the onboarding page. Admins and already-complete users pass through.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user &&
            $user->role !== 'admin' &&
            ! $this->isComplete($user) &&
            ! $request->routeIs('onboarding.*') &&
            ! $request->routeIs('logout')
        ) {
            return redirect()->route('onboarding.create');
        }

        return $next($request);
    }

    /**
     * A profile is complete once every personal field is filled in.
     */
    protected function isComplete($user): bool
    {
        return $user->birthday
            && $user->gender
            && $user->province
            && $user->city
            && $user->island
            && $user->address
            && $user->profile_photo;
    }
}
