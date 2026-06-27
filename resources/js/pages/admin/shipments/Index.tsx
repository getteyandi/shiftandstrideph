import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Package, Truck, CheckCircle2, Plus, Trash2, MapPin } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination, { type PaginationLink } from '@/components/Pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Shipment {
    id: number;
    tracking_id: string;
    item: string;
    courier: string | null;
    notes: string | null;
    status: 'preparing' | 'shipped' | 'delivered';
    runner: string | null;
    runner_photo: string | null;
    address: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string | null;
}
interface Runner {
    id: number;
    name: string;
    runner_code: string | null;
    address: string | null;
}
interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}
interface Props {
    shipments: Paginated<Shipment>;
    counts: Record<string, number>;
    filter: string;
    runners: Runner[];
}

const FILTERS = ['all', 'preparing', 'shipped', 'delivered'] as const;

const STATUS = {
    preparing: { label: 'Preparing', icon: Package, pill: 'bg-[#FEF3C7] text-[#92600A]' },
    shipped: { label: 'Shipped', icon: Truck, pill: 'bg-[#DBEAFE] text-[#1E40AF]' },
    delivered: { label: 'Delivered', icon: CheckCircle2, pill: 'bg-lime text-[#12150d]' },
} as const;

export default function Index({ shipments, counts, filter, runners }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);

    const form = useForm({
        user_id: '',
        item: '',
        courier: '',
        notes: '',
    });

    const selectedRunner = runners.find(
        (r) => String(r.id) === form.data.user_id,
    );

    const setFilter = (status: string) =>
        router.get(
            '/admin/shipments',
            status === 'all' ? {} : { status },
            { preserveScroll: true, preserveState: true },
        );

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.post('/admin/shipments', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const setStatus = (s: Shipment, status: string) =>
        router.patch(
            `/admin/shipments/${s.id}`,
            { status },
            { preserveScroll: true },
        );

    const remove = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/shipments/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Shipments" />

            <div className="space-y-8">
                {/* HERO */}
                <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />
                    <div className="relative">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[.28em] text-lime">
                            Administration
                        </p>
                        <h1 className="font-display text-5xl font-black italic text-white">
                            SHIPMENTS
                        </h1>
                        <p className="mt-3 max-w-xl text-sm text-[#98A08E]">
                            Assign a tracker to a runner and update its delivery
                            status.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
                    {/* CREATE FORM */}
                    <form
                        onSubmit={submit}
                        className="h-fit space-y-4 rounded-3xl border border-line bg-card p-6"
                    >
                        <h2 className="font-display text-2xl font-bold italic text-ink">
                            New Shipment
                        </h2>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-ink">
                                Runner
                            </label>
                            <Select
                                value={form.data.user_id}
                                onValueChange={(v) =>
                                    form.setData('user_id', v)
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl border-line bg-card py-5 text-ink">
                                    <SelectValue placeholder="Select a runner" />
                                </SelectTrigger>
                                <SelectContent className="border-line bg-card">
                                    {runners.map((r) => (
                                        <SelectItem
                                            key={r.id}
                                            value={String(r.id)}
                                        >
                                            {r.name}
                                            {r.runner_code
                                                ? ` (${r.runner_code})`
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.user_id && (
                                <p className="text-sm text-red-500">
                                    {form.errors.user_id}
                                </p>
                            )}

                            {selectedRunner && (
                                <div className="mt-1 flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                                    <MapPin
                                        size={15}
                                        className="mt-0.5 shrink-0 text-lime-deep"
                                    />
                                    <span className="text-muted-2">
                                        {selectedRunner.address ?? (
                                            <span className="text-red-500">
                                                No address on file — ask the
                                                runner to complete their
                                                profile.
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-ink">
                                Item
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Pre-Run Kit', 'Finisher Kit'].map((it) => {
                                    const on = form.data.item === it;
                                    return (
                                        <button
                                            key={it}
                                            type="button"
                                            onClick={() =>
                                                form.setData('item', it)
                                            }
                                            className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                                                on
                                                    ? 'border-lime bg-[#F7FCEB] text-ink'
                                                    : 'border-line bg-card text-muted hover:border-lime'
                                            }`}
                                        >
                                            {it}
                                        </button>
                                    );
                                })}
                            </div>
                            {form.errors.item && (
                                <p className="text-sm text-red-500">
                                    {form.errors.item}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-ink">
                                Courier (optional)
                            </label>
                            <Select
                                value={form.data.courier}
                                onValueChange={(v) =>
                                    form.setData('courier', v)
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl border-line bg-card py-5 text-ink">
                                    <SelectValue placeholder="Select a courier" />
                                </SelectTrigger>
                                <SelectContent className="border-line bg-card">
                                    <SelectItem value="J&T Express">
                                        J&amp;T Express
                                    </SelectItem>
                                    <SelectItem value="LBC">LBC</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.courier && (
                                <p className="text-sm text-red-500">
                                    {form.errors.courier}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-ink">
                                Notes (optional)
                            </label>
                            <textarea
                                rows={2}
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                className="w-full resize-y rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink outline-none transition focus:border-lime"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing || !form.data.user_id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3 font-bold text-[#12150d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Plus size={18} />
                            Create Tracker
                        </button>
                    </form>

                    {/* LIST */}
                    <div className="space-y-5">
                        <div className="flex flex-wrap gap-3">
                            {FILTERS.map((f) => {
                                const on = filter === f;
                                return (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${
                                            on
                                                ? 'bg-black text-lime'
                                                : 'border border-line bg-card text-muted hover:border-lime hover:text-lime'
                                        }`}
                                    >
                                        {f}
                                        <span className="ml-2 opacity-70">
                                            {counts[f] ?? 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {shipments.data.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-line bg-card py-16 text-center">
                                <Package
                                    className="mx-auto mb-3 text-lime"
                                    size={36}
                                />
                                <p className="font-semibold text-ink">
                                    No shipments
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {shipments.data.map((s) => {
                                    const meta = STATUS[s.status];
                                    return (
                                        <div
                                            key={s.id}
                                            className="rounded-3xl border border-[#dde3d5] bg-card p-5 shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-display text-xl font-black italic text-ink">
                                                        {s.item}
                                                    </div>
                                                    <div className="mt-0.5 text-sm text-muted-2">
                                                        {s.runner} ·{' '}
                                                        <span className="font-stat font-bold text-ink">
                                                            {s.tracking_id}
                                                        </span>
                                                        {s.courier
                                                            ? ` · ${s.courier}`
                                                            : ''}
                                                    </div>
                                                    {s.address && (
                                                        <div className="mt-1 inline-flex items-start gap-1.5 text-xs text-muted-2">
                                                            <MapPin
                                                                size={13}
                                                                className="mt-0.5 shrink-0"
                                                            />
                                                            {s.address}
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${meta.pill}`}
                                                >
                                                    {meta.label}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                {(
                                                    [
                                                        'preparing',
                                                        'shipped',
                                                        'delivered',
                                                    ] as const
                                                ).map((st) => {
                                                    const Icon = STATUS[st].icon;
                                                    const on = s.status === st;
                                                    return (
                                                        <button
                                                            key={st}
                                                            onClick={() =>
                                                                setStatus(s, st)
                                                            }
                                                            disabled={on}
                                                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-bold capitalize transition ${
                                                                on
                                                                    ? 'border-lime bg-lime text-[#12150d]'
                                                                    : 'border-line text-muted hover:border-lime hover:text-ink'
                                                            }`}
                                                        >
                                                            <Icon size={15} />
                                                            {st}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() =>
                                                        setDeleteTarget(s)
                                                    }
                                                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-300 text-red-500 transition hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Pagination paginator={shipments} />
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                destructive
                title="Delete shipment?"
                description={
                    deleteTarget
                        ? `Tracker ${deleteTarget.tracking_id} will be removed.`
                        : ''
                }
                confirmLabel="Delete"
                onConfirm={remove}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout active="shipments">{page}</AppLayout>
);
