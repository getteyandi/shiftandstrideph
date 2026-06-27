<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /** Full notifications page (history). */
    public function index()
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->paginate(20)
            ->through(fn ($n) => [
                'id' => $n->id,
                'title' => $n->data['title'] ?? 'Notification',
                'body' => $n->data['body'] ?? '',
                'url' => $n->data['url'] ?? null,
                'category' => $n->data['category'] ?? 'info',
                'read' => $n->read_at !== null,
                'time' => $n->created_at?->diffForHumans(),
            ]);

        return Inertia::render('notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    /** Mark a single notification read (and optionally follow its link). */
    public function markRead(Request $request, string $id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        if ($request->boolean('redirect') && ($notification->data['url'] ?? null)) {
            return redirect($notification->data['url']);
        }

        return back();
    }

    /** Mark every unread notification read. */
    public function markAllRead()
    {
        Auth::user()->unreadNotifications->markAsRead();

        return back();
    }
}
