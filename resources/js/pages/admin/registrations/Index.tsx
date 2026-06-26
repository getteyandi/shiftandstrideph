import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ClipboardList,
    Check,
    X,
    MapPin,
    Hash,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import RejectDialog from '@/components/RejectDialog';
import Pagination, { type PaginationLink } from '@/components/Pagination';

interface Registration {
    id: number;
    bib_number: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    rejection_reason?: string | null;
    created_at: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    event_category: {
        name: string;
        target_km: number | string;
        event: {
            name: string;
            location: string;
        } | null;
    } | null;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}

interface Props {
    registrations: Paginated<Registration>;
    counts: Record<string, number>;
    filter: string;
}

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'completed'] as const;

const statusPill = (status: string) => {
    switch (status) {
        case 'approved':
        case 'completed':
            return 'bg-lime text-[#12150d]';
        case 'pending':
            return 'bg-[#FEF3C7] text-[#92600A]';
        case 'rejected':
            return 'bg-[#FEE2E2] text-[#B91C1C]';
        default:
            return 'bg-[#E4E8DD] text-[#5A6152]';
    }
};

export default function Index({ registrations, counts, filter }: Props) {
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [rejecting, setRejecting] = useState(false);

    const visible = registrations.data;

    const setFilter = (status: string) =>
        router.get(
            '/admin/registrations',
            status === 'all' ? {} : { status },
            { preserveScroll: true, preserveState: true },
        );

    const approve = (id: number) =>
        router.patch(
            `/admin/registrations/${id}/approve`,
            {},
            { preserveScroll: true },
        );

    const reject = (reason: string) => {
        if (!rejectId) return;
        setRejecting(true);
        router.patch(
            `/admin/registrations/${rejectId}/reject`,
            { rejection_reason: reason },
            {
                preserveScroll: true,
                onSuccess: () => setRejectId(null),
                onFinish: () => setRejecting(false),
            },
        );
    };

    return (
        <>
            <Head title="Registrations" />

            <div className="space-y-8">
                {/* HERO */}
                <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />
                    <div className="relative">
                        <p className="mb-2 text-xs font-bold tracking-[.28em] uppercase text-lime">
                            Administration
                        </p>
                        <h1 className="font-display text-5xl font-black italic text-white">
                            REGISTRATIONS
                        </h1>
                        <p className="mt-3 max-w-xl text-sm text-[#98A08E]">
                            Approve or reject runners joining your event
                            categories.
                        </p>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-wrap gap-3">
                    {FILTERS.map((f) => {
                        const on = filter === f;
                        const count = counts[f] ?? 0;
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
                                <span className="ml-2 opacity-70">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* LIST */}
                {visible.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-line bg-card py-20 text-center">
                        <ClipboardList
                            className="mx-auto mb-4 text-lime"
                            size={40}
                        />
                        <h3 className="text-lg font-bold">
                            No {filter === 'all' ? '' : filter} registrations
                        </h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visible.map((r) => (
                            <div
                                key={r.id}
                                className="flex flex-col gap-4 rounded-3xl border border-[#dde3d5] bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-base font-bold text-white">
                                        {`${r.user.first_name[0] ?? ''}${
                                            r.user.last_name[0] ?? ''
                                        }`.toUpperCase()}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="font-display text-xl font-black italic text-ink">
                                            {r.user.first_name}{' '}
                                            {r.user.last_name}
                                        </div>
                                        <div className="text-sm text-muted">
                                            {r.user.email}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-[#70766a]">
                                            <span className="font-semibold text-ink">
                                                {r.event_category?.event
                                                    ?.name ?? '—'}
                                            </span>
                                            <span>
                                                {r.event_category?.name} ·{' '}
                                                {r.event_category?.target_km} km
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Hash size={13} />
                                                {r.bib_number}
                                            </span>
                                            {r.event_category?.event
                                                ?.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={13} />
                                                    {
                                                        r.event_category.event
                                                            .location
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:flex-col md:items-end lg:flex-row lg:items-center">
                                    <div className="flex flex-col items-end gap-1">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusPill(
                                                r.status,
                                            )}`}
                                        >
                                            {r.status}
                                        </span>
                                        {r.status === 'rejected' &&
                                            r.rejection_reason && (
                                                <span className="max-w-[220px] text-right text-[11px] text-[#B91C1C]">
                                                    {r.rejection_reason}
                                                </span>
                                            )}
                                    </div>

                                    {r.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => approve(r.id)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-sm font-bold text-[#12150d] transition hover:brightness-95"
                                            >
                                                <Check size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => setRejectId(r.id)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                            >
                                                <X size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination paginator={registrations} />
            </div>

            <RejectDialog
                open={rejectId !== null}
                onOpenChange={(o) => !o && setRejectId(null)}
                title="Reject registration"
                processing={rejecting}
                onConfirm={reject}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout active="registrations">{page}</AppLayout>
);
