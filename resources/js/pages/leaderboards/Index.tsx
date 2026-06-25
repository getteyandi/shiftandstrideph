import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Home, CalendarDays, Upload, Trophy, Shield } from 'lucide-react';
import RankRow from '@/components/RankRow';
import SectionHeader from '@/components/SectionHeader';

const NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: Home, route: 'dashboard' },
    {
        key: 'events',
        label: 'Events',
        icon: CalendarDays,
        route: 'events.index',
    },
    { key: 'submit', label: 'Submit Run', icon: Upload, route: 'runs.create' },
    {
        key: 'halloffame',
        label: 'Hall of Fame',
        icon: Trophy,
        route: 'hall-of-fame',
    },
    { key: 'admin', label: 'Admin', icon: Shield, route: 'admin.verification' },
];

const PODIUM_STYLE = {
    1: {
        order: 'order-2',
        avatar: 'w-[104px] h-[104px] text-[40px]',
        ring: 'border-lime',
        shadow: '0 0 30px rgba(166,226,18,.45)',
        barW: 'w-[clamp(110px,18vw,168px)]',
        barH: 'h-[128px]',
        barBg: 'bg-lime/10 border-lime/40',
        km: 'text-lime',
        badge: 'bg-lime',
    },
    2: {
        order: 'order-1',
        avatar: 'w-[78px] h-[78px] text-[30px]',
        ring: 'border-[#c0c6b6]',
        shadow: '0 0 30px rgba(192,198,182,.3)',
        barW: 'w-[clamp(96px,16vw,150px)]',
        barH: 'h-[92px]',
        barBg: 'bg-white/[.04] border-[#2a3320]',
        km: 'text-[#dfe6d4]',
        badge: 'bg-[#c0c6b6]',
    },
    3: {
        order: 'order-3',
        avatar: 'w-[70px] h-[70px] text-[26px]',
        ring: 'border-[#cd9b6a]',
        shadow: '0 0 30px rgba(205,155,106,.3)',
        barW: 'w-[clamp(90px,15vw,140px)]',
        barH: 'h-[72px]',
        barBg: 'bg-white/[.04] border-[#2a3320]',
        km: 'text-[#dfe6d4]',
        badge: 'bg-[#cd9b6a]',
    },
};

function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
}

// rankings: { overall:[], byEvent:[], byCategory:[] } each row { name, city, scope, km, is_me }
// podium: [{ rank, name, city, km }]   finishers: [{ name, event, category }]
export default function HallOfFame({
    rankings = {},
    podium = [],
    finishers = [],
    totalRunners = 0,
}) {
    const [tab, setTab] = useState('overall');
    const tabs = [
        { id: 'overall', label: 'Overall', scopeLabel: 'Events' },
        { id: 'event', label: 'By Event', scopeLabel: 'Scope' },
        { id: 'category', label: 'By Category', scopeLabel: 'Scope' },
    ];
    const dataset =
        tab === 'event'
            ? rankings.byEvent
            : tab === 'category'
              ? rankings.byCategory
              : rankings.overall;
    const rows = dataset ?? [];
    const scopeLabel = tabs.find((t) => t.id === tab)?.scopeLabel ?? 'Events';

    return (
        <div className="dark relative min-h-screen overflow-hidden bg-[#0A0C08] text-white">
            <Head title="Hall of Fame" />
            <div className="pointer-events-none absolute -top-[120px] left-1/2 h-[500px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(166,226,18,.16),transparent_65%)]" />

            {/* dark header
            <header className="sticky top-0 z-40 border-b border-[#1c2114] bg-[#0A0C08]/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1320px] items-center gap-[clamp(12px,3vw,32px)] px-[clamp(16px,4vw,40px)] py-3">
                    <Link
                        href={'/dashboard'}
                        className="flex shrink-0 items-center gap-[11px]"
                    >
                        <img
                            src="/assets/logo.png"
                            alt="Shift & Stride PH"
                            className="h-[42px] w-[42px] rounded-xl object-cover"
                        />
                        <div className="font-display text-[19px] font-extrabold text-white uppercase italic">
                            Shift<span className="text-lime"> &amp; </span>
                            Stride
                            <span className="align-super text-[12px] text-lime">
                                PH
                            </span>
                        </div>
                    </Link>
                    <nav className="ml-auto flex flex-wrap items-center justify-end gap-1">
                        {NAV.map(({ key, label, icon: Icon, route: r }) => {
                            const active = key === 'halloffame';
                            return (
                                <Link
                                    key={key}
                                    // href={route(r)}
                                    className={`flex items-center gap-2 rounded-[11px] px-3.5 py-[9px] text-sm font-semibold transition-colors ${
                                        active
                                            ? 'bg-lime text-ink-900'
                                            : 'text-[#9aa68d] hover:bg-[#1c2114]'
                                    }`}
                                >
                                    <Icon size={17} strokeWidth={2} />
                                    <span>{label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header> */}

            <main className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,4vw,48px)] pb-[70px]">
                {/* hero */}
                <div className="mb-10 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3.5 py-1.5">
                        <span className="h-2 w-2 animate-pulse2 rounded-full bg-lime" />
                        <span className="text-[11px] font-bold tracking-[.2em] text-lime uppercase">
                            Live Rankings · {totalRunners} Runners
                        </span>
                    </div>
                    <h1 className="m-0 bg-[linear-gradient(180deg,#ffffff,#9aa68d)] bg-clip-text font-display text-[clamp(44px,8vw,86px)] leading-[.85] font-extrabold text-transparent uppercase italic">
                        Hall of Fame
                    </h1>
                    <p className="mx-auto mt-3.5 max-w-[440px] text-[15px] text-[#8c9882]">
                        Every kilometer counts. Ranked by total approved
                        distance across all events.
                    </p>
                </div>

                {/* podium */}
                <div className="mb-12 flex flex-wrap items-end justify-center gap-[clamp(10px,2vw,22px)]">
                    {podium.map((p) => {
                        const s = PODIUM_STYLE[p.rank] ?? PODIUM_STYLE[3];
                        return (
                            <div
                                key={p.rank}
                                className={`flex-none text-center ${s.order}`}
                            >
                                <div className="relative mb-3.5 inline-block">
                                    <div
                                        className={`${s.avatar} rounded-full border-[3px] ${s.ring} flex items-center justify-center bg-[linear-gradient(145deg,#2a3320,#0c0f0b)] font-display font-extrabold text-white`}
                                        style={{ boxShadow: s.shadow }}
                                    >
                                        {initials(p.name)}
                                    </div>
                                    <span
                                        className={`absolute -bottom-2 left-1/2 h-[30px] w-[30px] -translate-x-1/2 rounded-full ${s.badge} flex items-center justify-center border-[3px] border-[#0A0C08] font-display text-base font-extrabold text-ink-900`}
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
                                    className={`${s.barW} mx-auto ${s.barH} border ${s.barBg} flex flex-col justify-start rounded-t-xl px-2.5 py-3.5`}
                                >
                                    <div
                                        className={`font-display text-[clamp(24px,3vw,34px)] leading-none font-extrabold italic ${s.km}`}
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
                    {tabs.map((t) => {
                        const on = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className={`rounded-full border px-[22px] py-2.5 font-display text-[15px] font-bold tracking-[.03em] uppercase italic transition-colors ${
                                    on
                                        ? 'border-lime bg-lime text-ink-900'
                                        : 'border-[#2a3320] bg-transparent text-[#9aa68d] hover:border-lime/60'
                                }`}
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
                        {rows.map((r, i) => (
                            <RankRow
                                key={i}
                                rank={i + 1}
                                name={r.name}
                                city={r.city}
                                scope={r.scope}
                                km={r.km}
                                me={r.is_me}
                            />
                        ))}
                    </div>
                </div>

                {/* newest finishers */}
                <div>
                    <SectionHeader
                        title="Newest Finishers"
                        titleClassName="text-white"
                        className="justify-center [&>div]:hidden"
                    >
                        <span />
                    </SectionHeader>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                        {finishers.map((f, i) => (
                            <div
                                key={i}
                                className="relative overflow-hidden rounded-2xl border border-[#242a1b] bg-panel p-[18px]"
                            >
                                <div className="absolute top-3 -right-[26px] rotate-[38deg] bg-lime px-[30px] py-[3px] font-display text-[10px] font-extrabold tracking-[.08em] text-ink-900 italic">
                                    FINISHED
                                </div>
                                <div className="mb-3 flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border-[1.5px] border-[#3a4628] bg-[linear-gradient(145deg,#222a18,#0c0f0b)] font-display text-[17px] font-bold text-white">
                                    {initials(f.name)}
                                </div>
                                <div className="text-[15px] font-bold text-white">
                                    {f.name}
                                </div>
                                <div className="mt-0.5 mb-2.5 text-[12.5px] text-[#8c9882]">
                                    {f.event}
                                </div>
                                <div className="inline-flex items-center rounded-full border border-lime/30 bg-lime/[.12] px-2.5 py-1">
                                    <span className="font-stat text-[13px] font-bold text-lime">
                                        {f.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
