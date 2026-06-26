import SectionHeader from '@/components/SectionHeader';
import StatTile from '@/components/StatTile';
import AppLayout from '@/layouts/app-layout';
import Pagination, { type PaginationLink } from '@/components/Pagination';
import RejectDialog from '@/components/RejectDialog';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Check,
    X,
    ImageIcon,
    MapPin,
    Hash,
    Maximize2,
} from 'lucide-react';

interface AdminStat {
    label: string;
    value: string | number;
    glow?: string;
}
interface EventTag {
    event_name: string | null;
    category_name: string | null;
    bib_number: string | null;
}
interface Submission {
    id: number | string;
    runner_name: string;
    runner_code: string;
    km: number | string;
    events: EventTag[];
    submitted_at: string;
    status: string; // 'pending' | 'approved' | 'rejected'
    photo_url?: string | null;
    notes?: string | null;
    rejection_reason?: string | null;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}

interface VerificationProps {
    stats: AdminStat[];
    submissions: Paginated<Submission>;
}

const statusPill = (status: string) => {
    switch (status) {
        case 'approved':
            return 'bg-lime text-[#12150d]';
        case 'rejected':
            return 'bg-[#FEE2E2] text-[#B91C1C]';
        default:
            return 'bg-[#FEF3C7] text-[#92600A]';
    }
};

export default function Verification({
    stats,
    submissions,
}: VerificationProps) {
    const [statusById, setStatusById] = useState<Record<string, string>>({});
    const [zoom, setZoom] = useState<Submission | null>(null);
    const [rejectId, setRejectId] = useState<Submission['id'] | null>(null);
    const [rejecting, setRejecting] = useState(false);

    const rows = submissions.data.map((s) => ({
        ...s,
        status: statusById[String(s.id)] ?? s.status,
    }));

    const pendingCount =
        stats.find((s) => s.label === 'Pending')?.value ?? 0;

    function approve(id: Submission['id']) {
        setStatusById((m) => ({ ...m, [String(id)]: 'approved' }));
        router.patch(
            `/admin/run-submissions/${id}/approve`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    function reject(reason: string) {
        if (rejectId === null) return;
        setRejecting(true);
        setStatusById((m) => ({ ...m, [String(rejectId)]: 'rejected' }));
        router.patch(
            `/admin/run-submissions/${rejectId}/reject`,
            { rejection_reason: reason },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setRejectId(null),
                onFinish: () => setRejecting(false),
            },
        );
    }

    return (
        <>
            <Head title="Run Verification" />

            <div className="animate-[floatup_.4s_ease_both]">
                <div className="mb-[22px]">
                    <div className="mb-1.5 text-[11px] font-bold tracking-[.28em] text-lime-deep uppercase">
                        Control Center
                    </div>
                    <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] leading-[.92] font-extrabold uppercase italic">
                        Run Verification
                    </h1>
                </div>

                <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
                    {stats.map((st) => (
                        <StatTile
                            key={st.label}
                            label={st.label}
                            value={st.value}
                            glow={st.glow}
                        />
                    ))}
                </div>

                <SectionHeader
                    title="Run Verification Queue"
                    aside={
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-2">
                            <span className="h-2 w-2 animate-[pulse2_2s_infinite] rounded-full bg-lime" />
                            {pendingCount} pending
                        </span>
                    }
                />

                {rows.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-line bg-card py-16 text-center">
                        <ImageIcon className="mx-auto mb-3 text-lime" size={36} />
                        <p className="font-semibold text-ink">
                            No run submissions yet
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {rows.map((s) => (
                            <div
                                key={s.id}
                                className="flex gap-4 rounded-[20px] border border-line bg-card p-4"
                            >
                                {/* PROOF PHOTO — click to enlarge for crosschecking */}
                                <button
                                    type="button"
                                    onClick={() => s.photo_url && setZoom(s)}
                                    className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#3a4a22,#161c0e)]"
                                >
                                    {s.photo_url ? (
                                        <>
                                            <img
                                                src={s.photo_url}
                                                alt="Run proof"
                                                className="h-full w-full object-cover"
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                                                <Maximize2 size={20} />
                                            </span>
                                        </>
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-white/60">
                                            <ImageIcon size={22} />
                                        </span>
                                    )}
                                </button>

                                {/* DETAILS */}
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="truncate text-[15px] font-bold text-ink">
                                                {s.runner_name}
                                            </div>
                                            <div className="text-[12.5px] font-semibold text-[#aeb4a4]">
                                                {s.runner_code} · {s.submitted_at}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="font-display text-[26px] leading-none font-extrabold text-ink italic">
                                                {s.km}
                                            </span>
                                            <span className="ml-0.5 text-[11px] font-bold text-[#9aa18d]">
                                                KM
                                            </span>
                                        </div>
                                    </div>

                                    {/* EVENT TAGS — one chip per chosen event */}
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {s.events.length === 0 ? (
                                            <span className="inline-flex rounded-full bg-[#F0F2EA] px-3 py-1 text-[11px] font-bold text-[#7F8C72]">
                                                No event
                                            </span>
                                        ) : (
                                            s.events.map((e, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1 text-[11px] font-bold text-lime"
                                                >
                                                    <MapPin size={11} />
                                                    {e.event_name}
                                                    {e.category_name && (
                                                        <span className="font-semibold text-white/70">
                                                            · {e.category_name}
                                                        </span>
                                                    )}
                                                    {e.bib_number && (
                                                        <span className="inline-flex items-center gap-0.5 text-white/60">
                                                            <Hash size={9} />
                                                            {e.bib_number}
                                                        </span>
                                                    )}
                                                </span>
                                            ))
                                        )}
                                    </div>

                                    {s.notes && (
                                        <p className="mt-2 line-clamp-2 text-[12.5px] text-muted">
                                            “{s.notes}”
                                        </p>
                                    )}

                                    {/* ACTIONS */}
                                    <div className="mt-auto flex items-center justify-end gap-2 pt-3">
                                        {s.status === 'pending' ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRejectId(s.id)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e9ccc8] bg-card px-4 py-[9px] text-[13.5px] font-bold text-[#c0392b] transition-colors hover:bg-[#fdf0ee]"
                                                >
                                                    <X size={15} />
                                                    Reject
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        approve(s.id)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-[10px] bg-ink-900 px-[18px] py-[9px] text-[13.5px] font-bold text-lime transition-colors hover:bg-lime hover:text-ink-900"
                                                >
                                                    <Check size={15} strokeWidth={2.6} />
                                                    Approve
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-end gap-1">
                                                <span
                                                    className={`rounded-full px-3.5 py-[7px] text-xs font-extrabold uppercase tracking-[.05em] ${statusPill(
                                                        s.status,
                                                    )}`}
                                                >
                                                    {s.status}
                                                </span>
                                                {s.status === 'rejected' &&
                                                    s.rejection_reason && (
                                                        <span className="max-w-[200px] text-right text-[11px] text-[#c0392b]">
                                                            {s.rejection_reason}
                                                        </span>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination paginator={submissions} />
            </div>

            <RejectDialog
                open={rejectId !== null}
                onOpenChange={(o) => !o && setRejectId(null)}
                title="Reject run submission"
                processing={rejecting}
                onConfirm={reject}
            />

            {/* PHOTO LIGHTBOX */}
            {zoom?.photo_url && (
                <div
                    onClick={() => setZoom(null)}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-card"
                    >
                        <div className="flex items-center justify-between border-b border-line px-5 py-3">
                            <div>
                                <div className="font-bold text-ink">
                                    {zoom.runner_name} · {zoom.km} KM
                                </div>
                                <div className="text-xs text-muted">
                                    {zoom.events
                                        .map((e) => e.event_name)
                                        .filter(Boolean)
                                        .join(', ') || 'No event'}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setZoom(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink transition hover:bg-[#f5f8ee]"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex max-h-[75vh] items-center justify-center bg-black">
                            <img
                                src={zoom.photo_url}
                                alt="Run proof full"
                                className="max-h-[75vh] w-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Verification.layout = (page: React.ReactNode) => (
    <AppLayout active="runs">{page}</AppLayout>
);
