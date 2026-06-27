import { Head } from '@inertiajs/react';
import { Package, Truck, CheckCircle2, Copy, MapPin } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';

interface Shipment {
    id: number;
    tracking_id: string;
    item: string;
    courier: string | null;
    notes: string | null;
    status: 'preparing' | 'shipped' | 'delivered';
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string | null;
}

interface Props {
    shipments: Shipment[];
}

const STEPS = [
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
] as const;

const stepIndex = (status: string) =>
    STEPS.findIndex((s) => s.key === status);

export default function Shipments({ shipments }: Props) {
    return (
        <div>
            <Head title="My Shipments" />

            <div className="animate-[floatup_.4s_ease_both] space-y-6">
                <div>
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[.28em] text-lime-deep">
                        Track · Receive
                    </div>
                    <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] font-extrabold uppercase italic leading-[.92] text-ink">
                        My Shipments
                    </h1>
                </div>

                {shipments.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-line bg-card py-20 text-center">
                        <Package className="mx-auto mb-3 text-lime" size={40} />
                        <p className="font-semibold text-ink">
                            No shipments yet
                        </p>
                        <p className="mt-1 text-sm text-muted">
                            Finisher rewards and merch will appear here once an
                            admin ships them.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {shipments.map((s) => {
                            const active = stepIndex(s.status);
                            return (
                                <div
                                    key={s.id}
                                    className="rounded-[20px] border border-line bg-card p-6"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-display text-2xl font-black italic text-ink">
                                                {s.item}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigator.clipboard?.writeText(
                                                            s.tracking_id,
                                                        )
                                                    }
                                                    title="Copy tracking ID"
                                                    className="inline-flex items-center gap-1.5 font-stat font-bold text-ink transition hover:text-lime-deep"
                                                >
                                                    {s.tracking_id}
                                                    <Copy size={13} />
                                                </button>
                                                {s.courier && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin size={13} />
                                                        {s.courier}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase text-[#12150d]">
                                            {s.status}
                                        </span>
                                    </div>

                                    {/* stepper */}
                                    <div className="mt-7 flex items-center">
                                        {STEPS.map((step, i) => {
                                            const Icon = step.icon;
                                            const done = i <= active;
                                            const date =
                                                step.key === 'shipped'
                                                    ? s.shipped_at
                                                    : step.key === 'delivered'
                                                      ? s.delivered_at
                                                      : s.created_at;
                                            return (
                                                <div
                                                    key={step.key}
                                                    className="flex flex-1 items-center last:flex-none"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                                                                done
                                                                    ? 'border-lime bg-lime text-[#12150d]'
                                                                    : 'border-line bg-card text-muted'
                                                            }`}
                                                        >
                                                            <Icon size={20} />
                                                        </div>
                                                        <div
                                                            className={`mt-2 text-xs font-bold uppercase tracking-wide ${
                                                                done
                                                                    ? 'text-ink'
                                                                    : 'text-muted'
                                                            }`}
                                                        >
                                                            {step.label}
                                                        </div>
                                                        <div className="text-[11px] text-muted-2">
                                                            {done && date
                                                                ? date
                                                                : '—'}
                                                        </div>
                                                    </div>
                                                    {i < STEPS.length - 1 && (
                                                        <div
                                                            className={`mx-2 h-1 flex-1 rounded-full ${
                                                                i < active
                                                                    ? 'bg-lime'
                                                                    : 'bg-line'
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {s.notes && (
                                        <p className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm text-muted-2">
                                            {s.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

Shipments.layout = (page: React.ReactNode) => (
    <AppLayout active="shipments">{page}</AppLayout>
);
