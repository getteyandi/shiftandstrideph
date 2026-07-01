import { Link } from '@inertiajs/react';
import { Check } from '@/lib/icons';
import { BarChart3, Award } from 'lucide-react';
import ProgressMeter from './ProgressMeter';

interface Registration {
    id?: number | string;
    event_id?: number | string;
    event_name: string;
    category_name: string;
    bib_number: string;
    distance_done: number;
    target_km: number;
    activity_count: number;
    last_activity_at: string;
    ranking_enabled: boolean;
    rank?: number | null;
    status?: string;
    banner?: string | null;
    is_highlighted?: boolean;
    preset?: 'solo' | 'community' | 'group';
}

const STATUS_PILL: Record<string, string> = {
    pending: 'bg-[#fff3d6] text-[#b07d00]',
    rejected: 'bg-[#fde4e1] text-[#c0392b]',
    approved: 'bg-[#eef7d8] text-[#5f8c00]',
};

const PRESET_LABEL: Record<string, string> = {
    solo: 'Solo Run',
    community: 'Community Run',
    group: 'Group Run',
};

function PresetTag({ preset }: { preset?: string }) {
    if (!preset) return null;
    return (
        <span className="inline-flex rounded-full bg-[#eef7d8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5f8c00]">
            {PRESET_LABEL[preset] ?? preset}
        </span>
    );
}

/**
 * Active event card for the Dashboard. Clickable → the event's live board.
 * The highlighted event renders as a full-width "spotlight".
 */
export default function ActiveEventCard({
    registration: r,
    spotlight = false,
}: {
    registration: Registration;
    spotlight?: boolean;
}) {
    const pct = Math.min(
        100,
        Math.round((r.distance_done / r.target_km) * 100),
    );
    const remaining = Math.max(0, +(r.target_km - r.distance_done).toFixed(1));
    const completed =
        r.status === 'completed' || r.distance_done >= r.target_km;

    const href = r.event_id ? `/events/${r.event_id}/board` : undefined;
    const Wrapper: any = href ? Link : 'article';
    const wrapperProps = href ? { href } : {};

    const downloadCert = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!r.id) return;
        // Trigger the download via a real anchor so it never collides with the
        // card's own navigation link.
        const a = document.createElement('a');
        a.href = `/certificates/${r.id}/download`;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    if (spotlight) {
        return (
            <Wrapper
                {...wrapperProps}
                className="group animate-spotlightglow relative col-span-full block overflow-hidden rounded-[20px] border border-lime/50 bg-[linear-gradient(145deg,#12150d,#090b08)] text-white transition"
            >
                {/* spotlight beam */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-1/3 left-1/2 h-[160%] w-[55%] -translate-x-1/2 animate-[pulse2_3s_ease-in-out_infinite]"
                    style={{
                        background:
                            'radial-gradient(closest-side, rgba(166,226,18,.22), transparent 70%)',
                    }}
                />
                {/* sweeping shine */}
                <div
                    aria-hidden
                    className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(166,226,18,.14), transparent)',
                    }}
                />
                {r.banner && (
                    <img
                        src={`/storage/${r.banner}`}
                        alt={r.event_name}
                        className="absolute inset-0 h-full w-full object-cover opacity-25"
                    />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,8,.45),rgba(9,11,8,.9))]" />
                <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <PresetTag preset={r.preset} />
                            <span className="rounded-[7px] bg-white/10 px-2.5 py-0.5 font-display text-sm font-bold italic text-lime">
                                {r.category_name}
                            </span>
                        </div>
                        <h3 className="font-display text-3xl font-black italic uppercase leading-tight text-white">
                            {r.event_name}
                        </h3>
                        <div className="mt-2 text-sm text-[#cdd3c3]">
                            Bib {r.bib_number} · {r.activity_count} activities ·{' '}
                            {remaining} KM to goal
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-[#12150d] transition group-hover:brightness-95">
                                <BarChart3 size={15} />
                                View Live Board
                            </span>
                            {completed && r.id ? (
                                <button
                                    type="button"
                                    onClick={downloadCert}
                                    className="inline-flex items-center gap-2 rounded-xl border border-lime/50 bg-white/10 px-5 py-2.5 text-sm font-bold text-lime transition hover:bg-lime hover:text-[#12150d]"
                                >
                                    <Award size={15} />
                                    Certificate
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="w-full max-w-xs">
                        <div className="mb-2 flex items-end justify-between">
                            <span className="font-display text-4xl font-black italic text-white">
                                {r.distance_done}
                                <span className="text-base font-semibold text-[#8c9882]">
                                    {' '}
                                    / {r.target_km} KM
                                </span>
                            </span>
                            <span className="font-display text-2xl font-bold italic text-lime">
                                {pct}%
                            </span>
                        </div>
                        <ProgressMeter pct={pct} onDark />
                    </div>
                </div>
            </Wrapper>
        );
    }

    return (
        <Wrapper
            {...wrapperProps}
            className="group relative block w-[88%] shrink-0 snap-center overflow-hidden rounded-[18px] border border-line bg-card p-[22px] shadow-[0_1px_2px_rgba(20,30,10,.05)] transition hover:border-lime sm:w-[60%] md:w-full"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-[7px] bg-ink-900 px-2.5 py-[3px] font-display text-sm font-bold tracking-[.02em] text-lime italic">
                            {r.category_name}
                        </span>
                        <PresetTag preset={r.preset} />
                        {r.ranking_enabled && r.rank != null ? (
                            <span className="rounded-full border border-[#d9eaa8] bg-[#f1f7e2] px-2 py-[3px] text-[10px] font-bold tracking-[.08em] text-lime-deep">
                                RANKED #{r.rank}
                            </span>
                        ) : null}
                    </div>
                    <h3 className="m-0 text-[16.5px] leading-tight font-bold text-ink">
                        {r.event_name}
                    </h3>
                </div>
                {completed ? (
                    <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full bg-lime px-2.5 py-[5px] text-[11px] font-extrabold tracking-[.04em] text-ink-900">
                        <Check size={12} strokeWidth={3} /> COMPLETED
                    </span>
                ) : r.status && r.status !== 'approved' ? (
                    <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-[5px] text-[11px] font-extrabold uppercase tracking-[.04em] ${
                            STATUS_PILL[r.status] ?? STATUS_PILL.pending
                        }`}
                    >
                        {r.status}
                    </span>
                ) : null}
            </div>

            <div className="mt-[18px] mb-2 flex items-end justify-between">
                <div>
                    <span className="font-display text-[34px] leading-none font-extrabold text-ink italic">
                        {r.distance_done}
                    </span>
                    <span className="text-[15px] font-semibold text-muted">
                        {' '}
                        / {r.target_km} KM
                    </span>
                </div>
                <span className="font-display text-[22px] font-bold text-lime-deep italic">
                    {pct}%
                </span>
            </div>

            <ProgressMeter pct={pct} />

            <div className="mt-[18px] flex flex-wrap gap-[18px] border-t border-dashed border-[#E4E8DD] pt-4">
                <Stat label="Bib No." value={r.bib_number} />
                <Stat label="Activities" value={r.activity_count} />
                <Stat label="Remaining" value={`${remaining} KM`} />
                <Stat
                    label="Last Activity"
                    value={r.last_activity_at}
                    alignEnd
                />
            </div>

            {completed && r.id ? (
                <button
                    type="button"
                    onClick={downloadCert}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-lime transition hover:bg-lime hover:text-ink"
                >
                    <Award size={16} />
                    Download certificate
                </button>
            ) : null}
        </Wrapper>
    );
}

function Stat({
    label,
    value,
    alignEnd = false,
}: {
    label: string;
    value: string | number;
    alignEnd?: boolean;
}) {
    return (
        <div className={alignEnd ? 'ml-auto text-right' : undefined}>
            <div className="text-[10px] font-bold tracking-[.14em] text-[#9aa18d] uppercase">
                {label}
            </div>
            <div className="font-stat text-sm font-bold text-[#3A4034]">
                {value}
            </div>
        </div>
    );
}
