<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\EnsureProfileIsComplete;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'profile.complete' => EnsureProfileIsComplete::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*'),
        );

        // When an upload exceeds PHP's post_max_size the request is rejected with
        // a 413 *before* validation ever runs, so the user is left staring at a
        // broken error page (e.g. onboarding never saves). Turn it into a normal
        // "file too large" validation error the form already knows how to show.
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() !== 413 || $request->is('api/*')) {
                return null;
            }

            $field = $request->routeIs('onboarding.*') || $request->is('*profile*')
                ? 'profile_photo'
                : 'file';

            return back()->withErrors([
                $field => 'That file is too large. Please upload an image under 5 MB.',
            ]);
        });
    })->create();
