import { Check } from 'lucide-react';
import ProgressMeter from '@/Components/ProgressMeter';

// registration: { bib_number, distance_done, activity_count, last_activity_at, rank, status,
//                 event:{name}, category:{name, target_km, ranking_enabled} }
export default function ActiveEventCard({ registration }) {
    const {
        bib_number,
        distance_done = 0,
        activity_count = 0,
        last_activity_at,
        rank,
        status,
        event,
        category,
    } = registration;
    const target = category?.target_km ?? 0;
    const pct = target
        ? Math.min(100, Math.round((distance_done / target) * 100))
        : 0;
    const remaining = Math.max(0, +(target - distance_done).toFixed(1));
    const completed = status === 'completed' || distance_done >= target;

    return (
        <article className="relative overflow-hidden rounded-[18px] border border-[#DFE3D6] bg-white p-[22px] shadow-[0_1px_2px_rgba(20,30,10,.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="mb-1.5 flex items-center gap-2">
                        <span className="rounded-[7px] bg-ink-900 px-2.5 py-[3px] font-display text-sm font-bold tracking-[.02em] text-lime italic">
                            {category?.name}
                        </span>
                        {category?.ranking_enabled && (
                            <span className="rounded-full border border-[#d9eaa8] bg-[#f1f7e2] px-2 py-[3px] text-[10px] font-bold tracking-[.08em] text-lime-deep">
                                RANKED #{rank}
                            </span>
                        )}
                    </div>
                    <h3 className="m-0 text-[16.5px] leading-tight font-bold text-ink">
                        {event?.name}
                    </h3>
                </div>
                {completed && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-[5px] text-[11px] font-extrabold tracking-[.04em] text-ink-900">
                        <Check size={12} strokeWidth={3} /> COMPLETED
                    </span>
                )}
            </div>

            <div className="mt-[18px] mb-2 flex items-end justify-between">
                <div>
                    <span className="font-display text-[34px] leading-none font-extrabold text-ink italic">
                        {distance_done}
                    </span>
                    <span className="text-[15px] font-semibold text-[#8A9080]">
                        {' '}
                        / {target} KM
                    </span>
                </div>
                <span className="font-display text-[22px] font-bold text-lime-deep italic">
                    {pct}%
                </span>
            </div>

            <ProgressMeter pct={pct} />

            <div className="mt-[18px] flex flex-wrap gap-[18px] border-t border-dashed border-[#E4E8DD] pt-4">
                <Meta label="Bib No." value={bib_number} />
                <Meta label="Activities" value={activity_count} />
                <Meta label="Remaining" value={`${remaining} KM`} />
                <Meta
                    label="Last Activity"
                    value={last_activity_at}
                    className="ml-auto text-right"
                />
            </div>
        </article>
    );
}

function Meta({ label, value, className = '' }) {
    return (
        <div className={className}>
            <div className="text-[10px] font-bold tracking-[.14em] text-[#9aa18d] uppercase">
                {label}
            </div>
            <div className="font-stat text-sm font-bold text-[#3A4034]">
                {value}
            </div>
        </div>
    );
}
