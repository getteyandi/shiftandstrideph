import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import PublicLayout from '@/layouts/PublicLayout';
import RankRow from '@/components/RankRow';
import SectionHeader from '@/components/SectionHeader';

interface Ranked {
    id: number | string;
    name: string;
    city: string;
    initials: string;
    /** Events count (Overall) or scope label ("Unity Run", "42KM") on tabs. */
    scope: string | number;
    km: number;
}
interface PodiumEntry {
    rank: 1 | 2 | 3;
    name: string;
    city: string;
    initials: string;
    km: number;
}
interface Finisher {
    id: number | string;
    name: string;
    initials: string;
    event: string;
    category: string;
}

interface HallOfFameProps {
    /** Ranked lists per tab. By Category is pre-filtered to ranking_enabled. */
    overall: Ranked[];
    byEvent: Ranked[];
    byCategory: Ranked[];
    podium: PodiumEntry[]; // top 3 of Overall
    finishers: Finisher[];
    totalRunners: string | number;
    /** Name of the signed-in runner, to highlight their row (optional). */
    currentRunnerName?: string;
}

const TABS = [
    { id: 'overall', label: 'Overall' },
    { id: 'event', label: 'By Event' },
    { id: 'category', label: 'By Category' },
] as const;
type TabId = (typeof TABS)[number]['id'];

/* Podium visual scale per rank (center is #1, tallest). */
type PodiumStyle = {
    order: number;
    size: string;
    fs: string;
    ring: string;
    shadow: string;
    barH: string;
    barTop: boolean;
};

const PODIUM_STYLE: Record<number, PodiumStyle> = {
    1: {
        order: 2,
        size: '104px',
        fs: '40px',
        ring: '#A6E212',
        shadow: 'rgba(166,226,18,.45)',
        barH: '128px',
        barTop: true,
    },
    2: {
        order: 1,
        size: '78px',
        fs: '30px',
        ring: '#c0c6b6',
        shadow: 'rgba(192,198,182,.3)',
        barH: '92px',
        barTop: false,
    },
    3: {
        order: 3,
        size: '70px',
        fs: '26px',
        ring: '#cd9b6a',
        shadow: 'rgba(205,155,106,.3)',
        barH: '72px',
        barTop: false,
    },
};

export default function HallOfFame({
    overall,
    byEvent,
    byCategory,
    podium,
    finishers,
    totalRunners,
    currentRunnerName,
}: HallOfFameProps) {
    const [tab, setTab] = useState<TabId>('overall');
    const dataset =
        tab === 'event' ? byEvent : tab === 'category' ? byCategory : overall;
    const scopeLabel = tab === 'overall' ? 'Events' : 'Scope';

    return (
        <PublicLayout active="halloffame">
            <Head title="Hall of Fame" />

            {/* hero */}
            <div className="mb-10 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3.5 py-1.5">
                    <span className="h-2 w-2 animate-[pulse2_1.8s_infinite] rounded-full bg-lime" />
                    <span className="text-[11px] font-bold tracking-[.2em] text-lime uppercase">
                        Live Rankings · {totalRunners} Runners
                    </span>
                </div>
                <h1 className="m-0 bg-[linear-gradient(180deg,#ffffff,#9aa68d)] bg-clip-text font-display text-[clamp(44px,8vw,86px)] leading-[.85] font-extrabold text-transparent uppercase italic">
                    Hall of Fame
                </h1>
                <p className="mx-auto mt-3.5 max-w-[440px] text-[15px] text-[#8c9882]">
                    Every kilometer counts. Ranked by total approved distance
                    across all events.
                </p>
            </div>

            {/* podium */}
            <div className="mb-12 flex flex-wrap items-end justify-center gap-[clamp(10px,2vw,22px)]">
                {podium.map((p) => {
                    const s = PODIUM_STYLE[p.rank];
                    return (
                        <div
                            key={p.rank}
                            className="flex-[0_0_auto] text-center"
                            style={{ order: s.order }}
                        >
                            <div className="relative mb-3.5 inline-block">
                                <div
                                    className="flex items-center justify-center rounded-full border-[3px] bg-[linear-gradient(145deg,#2a3320,#0c0f0b)] font-display font-extrabold text-white"
                                    style={{
                                        width: s.size,
                                        height: s.size,
                                        fontSize: s.fs,
                                        borderColor: s.ring,
                                        boxShadow: `0 0 30px ${s.shadow}`,
                                    }}
                                >
                                    {p.initials}
                                </div>
                                <span
                                    className="absolute -bottom-2 left-1/2 flex h-[30px] w-[30px] -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-[#0A0C08] font-display text-base font-extrabold text-ink-900"
                                    style={{ background: s.ring }}
                                >
                                    {p.rank}
                                </span>
                            </div>
                            <div className="text-[15px] font-bold text-white">
                                {p.name}
                            </div>
                            <div className="mb-2.5 text-xs text-[#8c9882]">
                                {p.city}
                            </div>
                            <div
                                className={cn(
                                    'mx-auto flex w-[clamp(96px,16vw,150px)] flex-col justify-start rounded-t-xl border px-2.5 py-3.5',
                                    s.barTop
                                        ? 'border-lime/40 bg-lime/10'
                                        : 'border-[#2a3320] bg-white/[.04]',
                                )}
                                style={{ height: s.barH }}
                            >
                                <div
                                    className={cn(
                                        'font-display text-[clamp(24px,3vw,34px)] leading-none font-extrabold italic',
                                        s.barTop
                                            ? 'text-lime'
                                            : 'text-[#dfe6d4]',
                                    )}
                                >
                                    {p.km}
                                </div>
                                <div className="text-[10px] font-bold tracking-[.14em] text-[#8c9882] uppercase">
                                    KM Total
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* tabs */}
            <div className="mb-[22px] flex flex-wrap justify-center gap-2">
                {TABS.map((t) => {
                    const on = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'rounded-full border px-[22px] py-2.5 font-display text-[15px] font-bold tracking-[.03em] uppercase italic transition-colors',
                                on
                                    ? 'border-lime bg-lime text-ink-900'
                                    : 'border-[#2a3320] bg-transparent text-[#9aa68d] hover:border-lime/50',
                            )}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* ranking table */}
            <div className="mx-auto mb-[50px] max-w-[760px]">
                <div className="flex items-center px-5 pb-2.5 text-[10.5px] font-bold tracking-[.14em] text-[#5f6a52] uppercase">
                    <div className="w-12">Rank</div>
                    <div className="flex-1">Runner</div>
                    <div className="w-[90px] text-right">{scopeLabel}</div>
                    <div className="w-[110px] text-right">Total KM</div>
                </div>
                <div className="flex flex-col gap-2">
                    {dataset.map((r, i) => (
                        <RankRow
                            key={r.id}
                            rank={i + 1}
                            runner={{
                                name: r.name,
                                city: r.city,
                                initials: r.initials,
                            }}
                            scope={r.scope}
                            km={r.km}
                            me={
                                !!currentRunnerName &&
                                r.name === currentRunnerName
                            }
                        />
                    ))}
                </div>
            </div>

            {/* newest finishers */}
            <div>
                <SectionHeader
                    title="Newest Finishers"
                    center
                    className="text-white"
                />
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    {finishers.map((f) => (
                        <div
                            key={f.id}
                            className="relative overflow-hidden rounded-2xl border border-border-dark bg-panel p-[18px]"
                        >
                            <div className="absolute top-3 -right-[26px] rotate-[38deg] bg-lime px-[30px] py-[3px] font-display text-[10px] font-extrabold tracking-[.08em] text-ink-900 italic">
                                FINISHED
                            </div>
                            <div className="mb-3 flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border-[1.5px] border-[#3a4628] bg-[linear-gradient(145deg,#222a18,#0c0f0b)] font-display text-[17px] font-bold text-white">
                                {f.initials}
                            </div>
                            <div className="text-[15px] font-bold text-white">
                                {f.name}
                            </div>
                            <div className="my-[3px] mb-2.5 text-[12.5px] text-[#8c9882]">
                                {f.event}
                            </div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/[.12] px-2.5 py-1">
                                <span className="font-stat text-[13px] font-bold text-lime">
                                    {f.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}
