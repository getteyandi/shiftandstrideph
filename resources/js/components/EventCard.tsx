import { Link } from '@inertiajs/react';
import { ArrowRight, MapPin } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface EventCardProps {
    event: {
        id: number | string;
        name: string;
        location: string;
        dates: string;
        status: string; // "Open" | "Soon" | ...
        joined_count: string | number;
        categories: string[]; // e.g. ["5KM","10KM","21KM","42KM"]
        /** Optional banner gradient; falls back to the brand ink gradient. */
        banner?: string;
    };
    /** Inertia route to join/view; defaults to events.show. */
    href?: string;
}

const INK_BANNER = 'linear-gradient(135deg,#1a2412,#0c0f0b)';

/**
 * Browse + join event card (HANDOFF.md §3). Banner with a dashed lime "route"
 * SVG, status pill, category chips, joined count, and the ink→lime Join CTA.
 */
export default function EventCard({ event, href }: EventCardProps) {
    const open = event.status.toLowerCase() === 'open';
    return (
        <article className="overflow-hidden rounded-[20px] border border-line bg-card shadow-[0_1px_2px_rgba(20,30,10,.05)]">
            <div
                className="relative h-32 overflow-hidden"
                style={{ background: event.banner || INK_BANNER }}
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
                    {event.status}
                </span>
                <div className="absolute inset-x-4 bottom-3">
                    <h3 className="m-0 font-display text-2xl leading-[.95] font-extrabold text-white uppercase italic [text-shadow:0_2px_12px_rgba(0,0,0,.5)]">
                        {event.name}
                    </h3>
                </div>
            </div>

            <div className="px-5 pt-[18px] pb-5">
                <div className="mb-3.5 flex items-center gap-3.5 text-[12.5px] font-semibold text-muted-2">
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} /> {event.location}
                    </span>
                    <span className="text-[#cfd4c5]">·</span>
                    <span>{event.dates}</span>
                </div>

                <div className="mb-[9px] text-[10px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                    Categories
                </div>
                <div className="mb-[18px] flex flex-wrap gap-2">
                    {event.categories.map((c) => (
                        <span
                            key={c}
                            className="rounded-[9px] border-[1.5px] border-[#e1e6d6] bg-[#f7f9f1] px-3 py-[5px] font-display text-sm font-bold text-[#3A4034] italic"
                        >
                            {c}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-muted-2">
                        {event.joined_count} runners joined
                    </span>
                    <Link
                        href={href ?? `/events/${event.id}`}
                        className="group inline-flex items-center gap-[7px] rounded-[11px] bg-ink-900 px-5 py-2.5 text-sm font-bold text-lime transition-colors hover:bg-lime hover:text-ink-900"
                    >
                        Join Event
                        <ArrowRight size={15} strokeWidth={2.4} />
                    </Link>
                </div>
            </div>
        </article>
    );
}
