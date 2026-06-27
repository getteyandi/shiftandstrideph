<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function index()
    {
        $shipments = Shipment::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn (Shipment $s) => [
                'id' => $s->id,
                'tracking_id' => $s->tracking_id,
                'item' => $s->item,
                'courier' => $s->courier,
                'notes' => $s->notes,
                'status' => $s->status,
                'shipped_at' => $s->shipped_at?->format('M j, Y'),
                'delivered_at' => $s->delivered_at?->format('M j, Y'),
                'created_at' => $s->created_at?->format('M j, Y'),
            ]);

        return Inertia::render('shipments/Index', [
            'shipments' => $shipments,
        ]);
    }
}
