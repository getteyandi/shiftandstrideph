import { Link } from '@inertiajs/react';
import { ArrowRight, MapPin } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface EventCardProps {
    id: number | string;
    name: string;
    location: string;
    dates: string;
    status: string; // "Open" | "Soon" | ...
    /** Optional banner gradient; falls back to the brand ink gradient. */
    banner?: string;
    description: string;

    /** Inertia route to join/view; defaults to events.show. */
    href?: string;
}

const INK_BANNER = 'linear-gradient(135deg,#1a2412,#0c0f0b)';

/**
 * Browse + join event card (HANDOFF.md §3). Banner with a dashed lime "route"
 * SVG, status pill, category chips, joined count, and the ink→lime Join CTA.
 */
export default function EventCard({
    id,
    name,
    location,
    dates,
    status,
    description,
    href,
}: EventCardProps) {
    const open = status.toLowerCase() === 'open';
    return (
        <article className="overflow-hidden rounded-[20px] border border-line bg-card shadow-[0_1px_2px_rgba(20,30,10,.05)]">
            <div
                className="relative h-32 overflow-hidden"
                style={{ background: INK_BANNER }}
            >
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(180deg,transparent,rgba(8,10,7,.7))',
                    }}
                />
                {/* dashed lime route line */}
                <svg
                    aria-hidden
                    viewBox="0 0 400 130"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full opacity-50"
                >
                    <path
                        d="M-10 110 C 80 60 140 130 220 80 S 360 40 420 70"
                        fill="none"
                        stroke="#A6E212"
                        strokeWidth="2.5"
                        strokeDasharray="2 9"
                        strokeLinecap="round"
                    />
                </svg>
                <span
                    className={cn(
                        'absolute top-3.5 left-3.5 rounded-full px-[11px] py-[5px] text-[10.5px] font-extrabold tracking-[.1em] uppercase',
                        open
                            ? 'bg-lime text-ink-900'
                            : 'bg-white/[.18] text-white',
                    )}
                >
                    {status}
                </span>
                <div className="absolute inset-x-4 bottom-3">
                    <h3 className="m-0 font-display text-2xl leading-[.95] font-extrabold text-white uppercase italic [text-shadow:0_2px_12px_rgba(0,0,0,.5)]">
                        {name}
                    </h3>
                </div>
            </div>

            <div className="px-5 pt-[18px]">
                <div className="mb-3.5 flex items-center gap-3.5 text-[12.5px] font-semibold text-muted-2">
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} /> {location}
                    </span>
                    <span className="text-[#cfd4c5]">·</span>
                    <span>{dates}</span>
                </div>
            </div>

            {/* Description */}

            <div className="border-line bg-card p-6">
                <h2 className="font-display text-2xl font-bold italic">
                    About this Event
                </h2>

                <p className="mt-3 leading-7 text-muted-2">{description}</p>
            </div>
        </article>
    );
}
