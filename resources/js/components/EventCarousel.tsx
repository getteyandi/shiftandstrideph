import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Users,
    Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface CarouselEvent {
    id: number | string;
    name: string;
    location: string;
    description: string;
    dates: string;
    status: string;
    is_highlighted: boolean;
    preset?: 'solo' | 'community' | 'group' | null;
    banner?: string | null;
    categories: string[];
    runners_count: number;
}

const PRESET_LABEL: Record<string, string> = {
    solo: 'Solo Run',
    community: 'Community Run',
    group: 'Group Run',
};

const INK_BANNER = 'linear-gradient(135deg,#1a2412,#0c0f0b)';
const AUTOPLAY_MS = 6000;

/**
 * Creative auto-advancing showcase of active events for the public landing
 * page. The highlighted event is surfaced first (the controller orders it to
 * the front) and wears a "Featured" badge so it visually stands out. A
 * thumbnail rail doubles as navigation. No runner-level data is ever shown —
 * only public event branding and an aggregate head-count.
 */
export default function EventCarousel({ events }: { events: CarouselEvent[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const railRef = useRef<HTMLDivElement>(null);

    const count = events.length;

    const go = useCallback(
        (next: number) => {
            if (count === 0) {
return;
}

            setIndex(((next % count) + count) % count);
        },
        [count],
    );

    // Auto-advance, pausing on hover/focus.
    useEffect(() => {
        if (paused || count <= 1) {
return;
}

        const timer = setInterval(
            () => setIndex((i) => (i + 1) % count),
            AUTOPLAY_MS,
        );

        return () => clearInterval(timer);
    }, [paused, count]);

    // Center the active thumbnail within the rail — scrolling ONLY the rail
    // horizontally, never the page (scrollIntoView would yank the whole window
    // back to the carousel on every autoplay tick).
    useEffect(() => {
        const rail = railRef.current;

        if (!rail) {
            return;
        }

        const active = rail.children[index] as HTMLElement | undefined;

        if (!active) {
            return;
        }

        rail.scrollTo({
            left:
                active.offsetLeft -
                rail.clientWidth / 2 +
                active.clientWidth / 2,
            behavior: 'smooth',
        });
    }, [index]);

    if (count === 0) {
        return (
            <div className="rounded-[24px] border border-border-dark bg-panel/60 p-12 text-center">
                <Sparkles
                    size={30}
                    className="mx-auto mb-3 text-lime opacity-70"
                />
                <h3 className="font-display text-2xl font-bold italic text-white">
                    New events dropping soon
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#9aa48c]">
                    We're lacing up the next season of virtual races. Create an
                    account to be first on the start line.
                </p>
            </div>
        );
    }

    const active = events[index];
    const featured = active.is_highlighted;

    return (
        <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            {/* Stage */}
            <div className="group relative overflow-hidden rounded-[24px] border border-border-dark shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)]">
                <div className="relative aspect-[16/10] w-full sm:aspect-[16/8] lg:aspect-[16/6.5]">
                    {events.map((ev, i) => (
                        <div
                            key={ev.id}
                            aria-hidden={i !== index}
                            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                                i === index
                                    ? 'opacity-100'
                                    : 'pointer-events-none opacity-0'
                            }`}
                        >
                            {ev.banner ? (
                                <img
                                    src={`/storage/${ev.banner}`}
                                    alt={ev.name}
                                    className="h-full w-full scale-105 object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-110"
                                />
                            ) : (
                                <div
                                    className="h-full w-full"
                                    style={{ background: INK_BANNER }}
                                />
                            )}
                            {/* dashed lime "route" line */}
                            <svg
                                aria-hidden
                                viewBox="0 0 1200 400"
                                preserveAspectRatio="none"
                                className="absolute inset-0 h-full w-full opacity-40 mix-blend-screen"
                            >
                                <path
                                    d="M-20 320 C 220 200 380 380 640 240 S 1020 120 1220 220"
                                    fill="none"
                                    stroke="#A6E212"
                                    strokeWidth="3"
                                    strokeDasharray="2 14"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    ))}

                    {/* legibility gradient */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,3,.94)_0%,rgba(6,8,3,.72)_42%,rgba(6,8,3,.25)_100%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,8,3,.85),transparent_55%)]" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-11">
                        <div className="max-w-2xl">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                {featured && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-900">
                                        <Sparkles size={12} strokeWidth={2.5} />
                                        Featured Event
                                    </span>
                                )}
                                <span
                                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.12em] ${
                                        active.status.toLowerCase() === 'open'
                                            ? 'bg-white/15 text-lime-bright'
                                            : 'bg-white/10 text-white/80'
                                    }`}
                                >
                                    {active.status}
                                </span>
                                {active.preset && (
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[.1em] text-white/75">
                                        {PRESET_LABEL[active.preset] ??
                                            active.preset}
                                    </span>
                                )}
                            </div>

                            <h3
                                className={`font-display font-black italic uppercase leading-[.9] text-white drop-shadow-[0_3px_20px_rgba(0,0,0,.6)] ${
                                    featured
                                        ? 'text-4xl sm:text-5xl lg:text-[64px]'
                                        : 'text-3xl sm:text-4xl lg:text-5xl'
                                }`}
                            >
                                {active.name}
                            </h3>

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-semibold text-[#d6dcc9]">
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin size={14} className="text-lime" />
                                    {active.location}
                                </span>
                                <span className="text-white/25">•</span>
                                <span>{active.dates}</span>
                                {active.runners_count > 0 && (
                                    <>
                                        <span className="text-white/25">•</span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Users
                                                size={14}
                                                className="text-lime"
                                            />
                                            {active.runners_count} runners
                                            joined
                                        </span>
                                    </>
                                )}
                            </div>

                            {active.categories.length > 0 && (
                                <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                                    {active.categories.map((c) => (
                                        <span
                                            key={c}
                                            className="rounded-lg border border-lime/30 bg-lime/10 px-2.5 py-1 font-display text-sm font-bold italic text-lime-bright"
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 rounded-xl bg-lime px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-lime-bright"
                                >
                                    Join this event
                                    <ArrowRight size={16} strokeWidth={2.5} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Arrows */}
                    {count > 1 && (
                        <>
                            <button
                                type="button"
                                aria-label="Previous event"
                                onClick={() => go(index - 1)}
                                className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-lime hover:bg-black/60 hover:text-lime"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                aria-label="Next event"
                                onClick={() => go(index + 1)}
                                className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-lime hover:bg-black/60 hover:text-lime"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    {/* Autoplay progress bar */}
                    {count > 1 && !paused && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                            <div
                                key={index}
                                className="h-full origin-left bg-lime"
                                style={{
                                    animation: `carouselProgress ${AUTOPLAY_MS}ms linear forwards`,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail rail */}
            {count > 1 && (
                <div
                    ref={railRef}
                    className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {events.map((ev, i) => (
                        <button
                            key={ev.id}
                            type="button"
                            aria-label={`Show ${ev.name}`}
                            aria-current={i === index}
                            onClick={() => go(i)}
                            className={`group/thumb relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-[70px] sm:w-36 ${
                                i === index
                                    ? 'border-lime'
                                    : 'border-transparent opacity-55 hover:opacity-90'
                            }`}
                        >
                            {ev.banner ? (
                                <img
                                    src={`/storage/${ev.banner}`}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span
                                    className="block h-full w-full"
                                    style={{ background: INK_BANNER }}
                                />
                            )}
                            <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,8,3,.85),transparent)]" />
                            {ev.is_highlighted && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime text-ink-900">
                                    <Sparkles size={9} strokeWidth={3} />
                                </span>
                            )}
                            <span className="absolute inset-x-1.5 bottom-1 truncate text-left font-display text-[11px] font-bold italic uppercase leading-tight text-white">
                                {ev.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
