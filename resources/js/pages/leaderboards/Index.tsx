import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Trophy,
    Search,
    Footprints,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Medal,
    Zap,
    Crown,
} from 'lucide-react';

import PublicLayout from '@/layouts/PublicLayout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface OverallRow {
    id: number;
    name: string;
    initials: string;
    city: string;
    photo: string | null;
    events: number;
    completed: number;
    km: number;
    recent: string | null;
}
interface EventTopRow {
    id: number;
    name: string;
    initials: string;
    photo: string | null;
    category: string;
    km: number;
}
interface EventRanking {
    id: number;
    name: string;
    location: string;
    top: EventTopRow[];
}
interface Finisher {
    id: number;
    name: string;
    initials: string;
    photo: string | null;
    city: string;
    km: number;
    event: string;
    category: string;
    finished_at: string;
}

interface Props {
    overall: OverallRow[];
    eventRankings: EventRanking[];
    newestFinishers: Finisher[];
    totalRunners: number;
}

const LIME = '#A6E212';

/** Avatar with the signature green ring (dark theme). */
function Avatar({
    photo,
    initials,
    size = 44,
    ring = '#3a4628',
}: {
    photo: string | null;
    initials: string;
    size?: number;
    ring?: string;
}) {
    return (
        <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#222a18,#0c0f0b)] font-display font-bold text-white"
            style={{
                width: size,
                height: size,
                border: `2.5px solid ${ring}`,
                fontSize: size * 0.34,
            }}
        >
            {photo ? (
                <img
                    src={`/storage/${photo}`}
                    alt={initials}
                    className="h-full w-full object-cover"
                />
            ) : (
                initials
            )}
        </div>
    );
}

/** Dark bento card with neon top-edge accent. */
function BentoCard({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-[22px] border border-[#1c2114] bg-[linear-gradient(180deg,#0e120b,#0a0c08)] p-6 ${className}`}
            style={{ borderTop: `4px solid ${LIME}` }}
        >
            {children}
        </div>
    );
}

const PER_RUNNERS = 5;
const PER_FINISHERS = 3;

export default function HallOfFame({
    overall,
    eventRankings,
    newestFinishers,
    totalRunners,
}: Props) {
    const [query, setQuery] = useState('');
    const [runnerPage, setRunnerPage] = useState(1);
    const [finisherPage, setFinisherPage] = useState(1);
    const [eventId, setEventId] = useState<string>(
        eventRankings[0]?.id ? String(eventRankings[0].id) : '',
    );

    /* ---- Hall of Runners (overall) — searchable + paginated ---- */
    const filtered = useMemo(
        () =>
            overall.filter((r) =>
                r.name.toLowerCase().includes(query.trim().toLowerCase()),
            ),
        [overall, query],
    );
    const runnerPages = Math.max(1, Math.ceil(filtered.length / PER_RUNNERS));
    const page = Math.min(runnerPage, runnerPages);
    const runnersSlice = filtered.slice(
        (page - 1) * PER_RUNNERS,
        page * PER_RUNNERS,
    );

    /* ---- Top contributors strip (task 2 of prior round) ---- */
    const topStrip = overall.slice(0, 6);

    /* ---- Top 3 finishers ---- */
    const selectedEvent =
        eventRankings.find((e) => String(e.id) === eventId) ??
        eventRankings[0];
    const podiumOrder = [1, 0, 2]; // render 2nd, 1st, 3rd

    /* ---- Newest finishers — paginated ---- */
    const finisherPages = Math.max(
        1,
        Math.ceil(newestFinishers.length / PER_FINISHERS),
    );
    const fpage = Math.min(finisherPage, finisherPages);
    const finishersSlice = newestFinishers.slice(
        (fpage - 1) * PER_FINISHERS,
        fpage * PER_FINISHERS,
    );

    const scrollToRunners = () =>
        document
            .getElementById('hall-of-runners')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <PublicLayout active="halloffame">
            <Head title="Hall of Fame" />

            <div className="space-y-7">
                {/* HERO */}
                <div className="pt-2 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3.5 py-1.5">
                        <span className="h-2 w-2 animate-[pulse2_1.8s_infinite] rounded-full bg-lime" />
                        <span className="text-[11px] font-bold uppercase tracking-[.2em] text-lime">
                            Live Rankings · {totalRunners} Runners
                        </span>
                    </div>
                    <h1
                        className="font-display text-[clamp(44px,8vw,86px)] font-black italic leading-[.85] text-lime"
                        style={{
                            textShadow:
                                '0 0 18px rgba(166,226,18,.5), 0 0 48px rgba(166,226,18,.3)',
                        }}
                    >
                        HALL OF FAME
                    </h1>
                    <p className="mx-auto mt-3 max-w-[460px] text-[15px] text-[#8c9882]">
                        Every kilometer counts. Ranked by total approved distance
                        across all events.
                    </p>
                </div>

                {/* ===== OVERALL CONTRIBUTION (podium) ===== */}
                <BentoCard className="p-[clamp(20px,3vw,40px)]">
                    <div className="mb-8 flex items-center justify-center gap-3">
                        <Trophy
                            size={24}
                            className="text-lime"
                            style={{
                                filter: 'drop-shadow(0 0 8px rgba(166,226,18,.7))',
                            }}
                        />
                        <h2 className="font-display text-[clamp(24px,3.4vw,40px)] font-black italic uppercase text-white">
                            Overall Contribution
                        </h2>
                    </div>

                    {overall.length === 0 ? (
                        <p className="py-10 text-center text-[#8c9882]">
                            No ranked distance yet — be the first to log a run.
                        </p>
                    ) : (
                        <>
                            {/* podium */}
                            <div className="flex flex-wrap items-end justify-center gap-[clamp(12px,2.5vw,30px)]">
                                {podiumOrder.map((idx) => {
                                    const p = overall[idx];
                                    if (!p) return null;
                                    const rank = idx + 1;
                                    const first = rank === 1;
                                    const ring =
                                        rank === 1
                                            ? LIME
                                            : rank === 2
                                              ? '#22D3EE'
                                              : '#FF3DAE';
                                    const glow =
                                        rank === 1
                                            ? 'rgba(166,226,18,.6)'
                                            : rank === 2
                                              ? 'rgba(34,211,238,.55)'
                                              : 'rgba(255,61,174,.55)';
                                    return (
                                        <div
                                            key={p.id}
                                            className="flex flex-col items-center text-center"
                                        >
                                            {first && (
                                                <Crown
                                                    size={28}
                                                    className="mb-1.5"
                                                    style={{
                                                        color: LIME,
                                                        filter: `drop-shadow(0 0 10px ${glow})`,
                                                    }}
                                                />
                                            )}
                                            <div className="relative">
                                                <Avatar
                                                    photo={p.photo}
                                                    initials={p.initials}
                                                    size={first ? 120 : 84}
                                                    ring={ring}
                                                />
                                                <span
                                                    className="absolute -bottom-1.5 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-[#0A0C08] font-display text-sm font-extrabold text-[#0A0C08]"
                                                    style={{
                                                        background: ring,
                                                        boxShadow: `0 0 14px ${glow}`,
                                                    }}
                                                >
                                                    {rank}
                                                </span>
                                            </div>
                                            <div className="mt-3 text-[15px] font-extrabold uppercase text-white">
                                                {p.name}
                                            </div>
                                            <div className="text-xs text-[#8c9882]">
                                                {p.city} · {p.events} events
                                            </div>
                                            <div
                                                className="mt-1 font-display font-black italic"
                                                style={{
                                                    fontSize: first ? 38 : 28,
                                                    color: ring,
                                                    textShadow: `0 0 16px ${glow}`,
                                                }}
                                            >
                                                {p.km.toLocaleString()}
                                                <span className="ml-1 text-xs font-bold not-italic text-[#8c9882]">
                                                    KM
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* row of profiles for the other ranks + view all */}
                            {topStrip.length > 3 && (
                                <div className="mt-10 flex flex-col items-center gap-4 border-t border-[#1c2114] pt-7 sm:flex-row sm:justify-between">
                                    <div className="flex items-center">
                                        {topStrip.slice(3).map((r, i) => (
                                            <div
                                                key={r.id}
                                                className="relative"
                                                style={{
                                                    marginLeft: i === 0 ? 0 : -12,
                                                    zIndex: topStrip.length - i,
                                                }}
                                                title={`#${i + 4} ${r.name}`}
                                            >
                                                <Avatar
                                                    photo={r.photo}
                                                    initials={r.initials}
                                                    size={46}
                                                    ring="#3a4628"
                                                />
                                                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0A0C08] bg-[#1c2114] text-[9px] font-bold text-[#dfe6d4]">
                                                    {i + 4}
                                                </span>
                                            </div>
                                        ))}
                                        <span className="ml-4 text-sm font-semibold text-[#8c9882]">
                                            + {overall.length} runners ranked
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={scrollToRunners}
                                        className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-[#12150d] transition hover:brightness-95"
                                    >
                                        View Overall Ranking
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </BentoCard>

                {/* BENTO */}
                <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                    {/* ===== HALL OF RUNNERS ===== */}
                    <BentoCard className="lg:row-span-2">
                        <div id="hall-of-runners" className="scroll-mt-24">
                            <div className="mb-4 flex items-center gap-2">
                                <Trophy size={20} className="text-lime" />
                                <h2 className="font-display text-2xl font-black italic uppercase text-white">
                                    Hall of Runners
                                </h2>
                            </div>

                            <div className="relative mb-4">
                                <Search
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6a52]"
                                />
                                <input
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setRunnerPage(1);
                                    }}
                                    placeholder="Search runner..."
                                    className="w-full rounded-xl border border-[#1c2114] bg-[#0a0c08] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#5f6a52] outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/10"
                                />
                            </div>

                            {runnersSlice.length === 0 ? (
                                <p className="py-10 text-center text-sm text-[#8c9882]">
                                    No runners found.
                                </p>
                            ) : (
                                <div className="space-y-2.5">
                                    {runnersSlice.map((r) => {
                                        const rank =
                                            overall.findIndex(
                                                (o) => o.id === r.id,
                                            ) + 1;
                                        return (
                                            <div
                                                key={r.id}
                                                className="flex items-center gap-3.5 rounded-2xl border border-[#1c2114] bg-white/[.03] px-4 py-3 transition-colors hover:border-lime/40"
                                            >
                                                <span className="w-5 text-center font-display text-sm font-black italic text-[#5f6a52]">
                                                    {rank}
                                                </span>
                                                <Avatar
                                                    photo={r.photo}
                                                    initials={r.initials}
                                                    ring={
                                                        rank <= 3
                                                            ? LIME
                                                            : '#3a4628'
                                                    }
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-[15px] font-extrabold uppercase text-white">
                                                        {r.name}
                                                    </div>
                                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#8c9882]">
                                                        {r.city}
                                                    </div>
                                                    {r.recent && (
                                                        <div className="mt-0.5 text-[11px] text-lime">
                                                            <span className="font-bold uppercase">
                                                                Recent ·{' '}
                                                            </span>
                                                            {r.recent}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="inline-flex items-center gap-1 font-stat text-[15px] font-extrabold text-white">
                                                        <Footprints
                                                            size={13}
                                                            className="text-lime"
                                                        />
                                                        {r.km.toLocaleString()} KM
                                                    </div>
                                                    <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#8c9882]">
                                                        <Trophy size={11} />
                                                        {r.completed} Completed
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <Pager
                                page={page}
                                pages={runnerPages}
                                onChange={setRunnerPage}
                            />
                        </div>
                    </BentoCard>

                    {/* ===== TOP 3 FINISHERS ===== */}
                    <BentoCard>
                        <div className="mb-4 flex items-center gap-2">
                            <Medal size={20} className="text-lime" />
                            <h2 className="font-display text-2xl font-black italic uppercase text-white">
                                Top 3 Finishers
                            </h2>
                        </div>

                        {eventRankings.length === 0 ? (
                            <p className="py-8 text-center text-sm text-[#8c9882]">
                                No event leaders yet.
                            </p>
                        ) : (
                            <>
                                <Select
                                    value={eventId}
                                    onValueChange={setEventId}
                                >
                                    <SelectTrigger className="mb-5 w-full rounded-xl border-[#1c2114] bg-[#0a0c08] py-5 text-sm font-semibold text-white focus:border-lime focus:ring-2 focus:ring-lime/20 [&_svg]:text-lime">
                                        <SelectValue placeholder="Select an event" />
                                    </SelectTrigger>
                                    <SelectContent className="border-[#1c2114] bg-[#0e120b] text-white">
                                        {eventRankings.map((e) => (
                                            <SelectItem
                                                key={e.id}
                                                value={String(e.id)}
                                                className="text-[#dfe6d4] focus:bg-lime/15 focus:text-lime"
                                            >
                                                {e.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="rounded-2xl border border-[#1c2114] bg-[radial-gradient(420px_180px_at_50%_-20%,rgba(166,226,18,.16),transparent_60%)] p-5">
                                    <div className="flex items-end justify-center gap-3">
                                        {podiumOrder.map((idx) => {
                                            const p = selectedEvent?.top[idx];
                                            if (!p) return null;
                                            const rank = idx + 1;
                                            const first = rank === 1;
                                            const block =
                                                rank === 1
                                                    ? 'bg-lime text-[#12150d]'
                                                    : rank === 2
                                                      ? 'bg-[#2a3320] text-[#dfe6d4]'
                                                      : 'bg-white/[.06] text-[#dfe6d4]';
                                            return (
                                                <div
                                                    key={p.id}
                                                    className="flex flex-1 flex-col items-center"
                                                >
                                                    <Avatar
                                                        photo={p.photo}
                                                        initials={p.initials}
                                                        size={first ? 70 : 54}
                                                        ring={
                                                            first
                                                                ? LIME
                                                                : '#3a4628'
                                                        }
                                                    />
                                                    <div className="mt-2 line-clamp-1 text-center text-[12px] font-extrabold uppercase text-white">
                                                        {p.name}
                                                    </div>
                                                    <div
                                                        className={`mt-2 flex w-full flex-col items-center justify-center rounded-xl px-2 ${block}`}
                                                        style={{
                                                            height: first
                                                                ? 96
                                                                : rank === 2
                                                                  ? 76
                                                                  : 62,
                                                            boxShadow: first
                                                                ? '0 0 26px rgba(166,226,18,.4)'
                                                                : undefined,
                                                        }}
                                                    >
                                                        <span className="font-stat text-sm font-extrabold">
                                                            {p.km.toLocaleString()}{' '}
                                                            KM
                                                        </span>
                                                    </div>
                                                    <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#8c9882]">
                                                        Top {rank}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </BentoCard>

                    {/* ===== NEWEST FINISHERS ===== */}
                    <BentoCard>
                        <div className="mb-1 flex items-center gap-2">
                            <Zap size={20} className="text-lime" />
                            <h2 className="font-display text-2xl font-black italic uppercase text-white">
                                Newest Finishers
                            </h2>
                        </div>

                        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#12150d]">
                            Latest Finishes
                        </span>

                        {finishersSlice.length === 0 ? (
                            <p className="py-8 text-center text-sm text-[#8c9882]">
                                No finishers yet.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {finishersSlice.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex items-center gap-3.5 rounded-2xl border border-[#1c2114] bg-white/[.03] px-4 py-3"
                                    >
                                        <Avatar
                                            photo={f.photo}
                                            initials={f.initials}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[15px] font-extrabold uppercase text-white">
                                                {f.name}
                                            </div>
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#8c9882]">
                                                {f.city}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center gap-1 font-stat text-[15px] font-extrabold text-white">
                                                <Footprints
                                                    size={13}
                                                    className="text-lime"
                                                />
                                                {f.km.toLocaleString()} KM
                                            </div>
                                            <div className="text-[11px] font-bold text-[#8c9882]">
                                                {f.category} {f.event}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Pager
                            page={fpage}
                            pages={finisherPages}
                            onChange={setFinisherPage}
                        />
                    </BentoCard>
                </div>
            </div>
        </PublicLayout>
    );
}

function Pager({
    page,
    pages,
    onChange,
}: {
    page: number;
    pages: number;
    onChange: (p: number) => void;
}) {
    if (pages <= 1) return null;
    const nums = Array.from({ length: pages }, (_, i) => i + 1);
    const btn =
        'flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-sm font-bold transition';
    return (
        <div className="mt-5 flex items-center justify-center gap-1.5">
            <button
                type="button"
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
                className={`${btn} border-[#1c2114] text-[#8c9882] hover:border-lime disabled:opacity-40`}
            >
                <ChevronLeft size={15} />
            </button>
            {nums.map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={`${btn} ${
                        n === page
                            ? 'border-lime bg-lime text-[#12150d]'
                            : 'border-[#1c2114] text-[#8c9882] hover:border-lime'
                    }`}
                >
                    {n}
                </button>
            ))}
            <button
                type="button"
                disabled={page === pages}
                onClick={() => onChange(page + 1)}
                className={`${btn} border-[#1c2114] text-[#8c9882] hover:border-lime disabled:opacity-40`}
            >
                <ChevronRight size={15} />
            </button>
        </div>
    );
}
