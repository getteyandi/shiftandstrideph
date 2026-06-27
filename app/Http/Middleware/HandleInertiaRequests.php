<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'notifications' => [
                'unread' => $user ? $user->unreadNotifications()->count() : 0,
                'items' => $user
                    ? $user->notifications()->take(8)->get()->map(fn ($n) => [
                        'id' => $n->id,
                        'title' => $n->data['title'] ?? 'Notification',
                        'body' => $n->data['body'] ?? '',
                        'url' => $n->data['url'] ?? null,
                        'category' => $n->data['category'] ?? 'info',
                        'read' => $n->read_at !== null,
                        'time' => $n->created_at?->diffForHumans(),
                    ])
                    : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
