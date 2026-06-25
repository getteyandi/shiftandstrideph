import { Check } from '@/lib/icons';
import ProgressMeter from './ProgressMeter';

interface ActiveEventCardProps {
    registration: {
        event_name: string;
        category_name: string; // e.g. "300 KM"
        bib_number: string;
        distance_done: number;
        target_km: number;
        activity_count: number;
        last_activity_at: string; // pre-formatted, e.g. "Jun 24"
        ranking_enabled: boolean;
        rank?: number;
        /** Derived server-side or below; either works. */
        status?: string;
    };
}

/**
 * Active event card for the Dashboard (HANDOFF.md §4). Shows category chip,
 * optional RANKED badge, animated progress, and a dashed-rule footer with
 * bib / activities / remaining / last activity.
 */
export default function ActiveEventCard({
    registration: r,
}: ActiveEventCardProps) {
    const pct = Math.min(
        100,
        Math.round((r.distance_done / r.target_km) * 100),
    );
    const remaining = Math.max(0, +(r.target_km - r.distance_done).toFixed(1));
    const completed =
        r.status === 'completed' || r.distance_done >= r.target_km;

    return (
        <article className="relative overflow-hidden rounded-[18px] border border-line bg-card p-[22px] shadow-[0_1px_2px_rgba(20,30,10,.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="mb-1.5 flex items-center gap-2">
                        <span className="rounded-[7px] bg-ink-900 px-2.5 py-[3px] font-display text-sm font-bold tracking-[.02em] text-lime italic">
                            {r.category_name}
                        </span>
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
        </article>
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
