import { useState, useEffect } from 'react';
import { X, MapPin, Hash, CalendarDays, ExternalLink } from 'lucide-react';

interface EventTag {
    event_name: string | null;
    category_name: string | null;
    bib_number: string | null;
}

export interface RunDetails {
    id: number | string;
    runner_name: string;
    runner_code: string;
    km: number | string;
    run_date?: string | null;
    submitted_at: string;
    events: EventTag[];
    status: string;
    photo_url?: string | null;
    proof_link?: string | null;
    notes?: string | null;
    rejection_reason?: string | null;
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

/**
 * Full-detail view of a single run submission, including the enlarged proof
 * photo. Opened from the "View" button (or by clicking the thumbnail) so an
 * admin can inspect everything about a submission in one place.
 */
export default function RunDetailsDialog({
    run,
    onClose,
}: {
    run: RunDetails | null;
    onClose: () => void;
}) {
    const [imgError, setImgError] = useState(false);

    // Reset the image error state each time a different run is opened.
    useEffect(() => {
        setImgError(false);
    }, [run?.id]);

    if (!run) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card"
            >
                {/* HEADER */}
                <div className="sticky top-0 flex items-center justify-between border-b border-line bg-card px-5 py-4">
                    <div className="min-w-0">
                        <div className="truncate font-display text-2xl font-black italic text-ink">
                            {run.runner_name}
                        </div>
                        <div className="text-xs text-muted">
                            {run.runner_code} · Submitted {run.submitted_at}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink transition hover:bg-[#f5f8ee]"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="font-display text-3xl font-black italic text-ink">
                            {run.km}
                            <span className="ml-1 text-sm font-bold not-italic text-muted">
                                KM
                            </span>
                        </span>
                        <span
                            className={`rounded-full px-3.5 py-[7px] text-xs font-extrabold uppercase tracking-[.05em] ${statusPill(
                                run.status,
                            )}`}
                        >
                            {run.status}
                        </span>
                        {run.run_date && (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-lime-deep">
                                <CalendarDays size={14} />
                                Ran {run.run_date}
                            </span>
                        )}
                    </div>

                    {/* EVENTS */}
                    <div className="flex flex-wrap gap-1.5">
                        {run.events.length === 0 ? (
                            <span className="inline-flex rounded-full bg-[#F0F2EA] px-3 py-1 text-[11px] font-bold text-[#7F8C72]">
                                No event
                            </span>
                        ) : (
                            run.events.map((e, i) => (
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

                    {run.notes && (
                        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
                            “{run.notes}”
                        </p>
                    )}

                    {run.status === 'rejected' && run.rejection_reason && (
                        <p className="rounded-xl bg-[#fde4e1] px-4 py-3 text-sm font-semibold text-[#c0392b]">
                            Rejected: {run.rejection_reason}
                        </p>
                    )}

                    {/* PROOF */}
                    <div>
                        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#92A084]">
                            Proof of run
                        </div>
                        {run.photo_url && !imgError ? (
                            <img
                                src={run.photo_url}
                                alt="Run proof"
                                onError={() => setImgError(true)}
                                className="w-full rounded-xl border border-line bg-black object-contain"
                            />
                        ) : run.proof_link ? (
                            <a
                                href={run.proof_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-lime-deep transition hover:border-lime"
                            >
                                <ExternalLink size={16} />
                                Open proof link
                            </a>
                        ) : run.photo_url && imgError ? (
                            <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                                The proof image couldn’t be loaded.
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                                No proof provided.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
