<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminShipmentController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('status', 'all');

        $counts = Shipment::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $shipments = Shipment::with('user')
            ->when(
                in_array($filter, ['preparing', 'shipped', 'delivered'], true),
                fn ($q) => $q->where('status', $filter),
            )
            ->latest()
            ->paginate(8)
            ->withQueryString()
            ->through(fn (Shipment $s) => [
                'id' => $s->id,
                'tracking_id' => $s->tracking_id,
                'item' => $s->item,
                'courier' => $s->courier,
                'notes' => $s->notes,
                'status' => $s->status,
                'runner' => $s->user?->full_name,
                'runner_photo' => $s->user?->profile_photo,
                'address' => $s->user?->address,
                'shipped_at' => $s->shipped_at?->format('M j, Y'),
                'delivered_at' => $s->delivered_at?->format('M j, Y'),
                'created_at' => $s->created_at?->format('M j, Y'),
            ]);

        return Inertia::render('admin/shipments/Index', [
            'shipments' => $shipments,
            'counts' => [
                'all' => (int) $counts->sum(),
                'preparing' => (int) ($counts['preparing'] ?? 0),
                'shipped' => (int) ($counts['shipped'] ?? 0),
                'delivered' => (int) ($counts['delivered'] ?? 0),
            ],
            'filter' => $filter,
            'runners' => User::where('role', 'participant')
                ->orderBy('first_name')
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->full_name,
                    'runner_code' => $u->runner_code,
                    'address' => $u->address,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'item' => ['required', 'in:Pre-Run Kit,Finisher Kit'],
            'courier' => ['nullable', 'in:J&T Express,LBC'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['tracking_id'] = $this->uniqueTrackingId();
        $validated['status'] = 'preparing';

        $shipment = Shipment::create($validated);

        $this->notifyUsers(
            User::find($validated['user_id']),
            'Shipment on the way',
            "Your {$shipment->item} (#{$shipment->tracking_id}) is being prepared.",
            route('shipments.index'),
            'info',
        );

        $this->toast('Shipment created.');

        return back();
    }

    public function update(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:preparing,shipped,delivered'],
        ]);

        $shipment->update([
            'status' => $validated['status'],
            'shipped_at' => $validated['status'] === 'shipped' && ! $shipment->shipped_at
                ? now()
                : $shipment->shipped_at,
            'delivered_at' => $validated['status'] === 'delivered' && ! $shipment->delivered_at
                ? now()
                : $shipment->delivered_at,
        ]);

        $messages = [
            'preparing' => "Your {$shipment->item} (#{$shipment->tracking_id}) is being prepared.",
            'shipped' => "Your {$shipment->item} (#{$shipment->tracking_id}) is on its way!",
            'delivered' => "Your {$shipment->item} (#{$shipment->tracking_id}) has been delivered.",
        ];

        $this->notifyUsers(
            $shipment->user,
            'Shipment ' . $validated['status'],
            $messages[$validated['status']] ?? "Your shipment status is now {$validated['status']}.",
            route('shipments.index'),
            'info',
        );

        $this->toast("Shipment marked as {$validated['status']}.");

        return back();
    }

    public function destroy(Shipment $shipment)
    {
        $shipment->delete();

        $this->toast('Shipment deleted.');

        return back();
    }

    private function uniqueTrackingId(): string
    {
        do {
            $id = 'SSP-' . strtoupper(Str::random(8));
        } while (Shipment::where('tracking_id', $id)->exists());

        return $id;
    }
}
