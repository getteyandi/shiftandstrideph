import ActiveEventCard from '@/components/ActiveEventCard';
import ProgressMeter from '@/Components/ProgressMeter';
import RunnerHero from '@/components/RunnerHero';
import SectionHeader from '@/components/SectionHeader';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Check, Star, FileCheck, Send } from 'lucide-react';

const NOTIF_STYLE = {
    approved: { icon: Check, bg: '#eef7d8', fg: '#5f8c00' },
    badge: { icon: Star, bg: '#fdf3d6', fg: '#b8860b' },
    certificate: { icon: FileCheck, bg: '#e3eefc', fg: '#2563aa' },
    event: { icon: Send, bg: '#f0eafc', fg: '#7c4fc4' },
};

export default function Dashboard({
    runner = {},
    registrations = [],
    topContribution = null,
    notifications = [],
}) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="animate-floatup">
                <RunnerHero runner={runner} />

                <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-start gap-6">
                    {/* Active events (full width) */}
                    <div className="col-span-full">
                        <SectionHeader title="Active Events">
                            <span className="text-[13px] font-semibold text-[#8A9080]">
                                {registrations.length} registrations
                            </span>
                        </SectionHeader>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-[18px]">
                            {registrations.map((r, i) => (
                                <ActiveEventCard
                                    key={r.id ?? i}
                                    registration={r}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Top contribution */}
                    {topContribution && (
                        <div>
                            <SectionHeader title="Top Contribution" />
                            <div className="relative overflow-hidden rounded-[18px] border border-[#2a3120] bg-[linear-gradient(150deg,#12150d,#0c0f0b)] p-6">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(300px_200px_at_100%_0,rgba(166,226,18,.18),transparent_60%)]" />
                                <div className="relative">
                                    <div className="text-[11px] font-bold tracking-[.2em] text-lime uppercase">
                                        {topContribution.event} ·{' '}
                                        {topContribution.target} KM
                                    </div>
                                    <div className="my-3.5 flex items-end gap-2.5">
                                        <div className="font-display text-[54px] leading-[.85] font-extrabold text-white italic">
                                            #{topContribution.rank}
                                        </div>
                                        <div className="pb-1.5 text-[13px] font-semibold text-[#8c9882]">
                                            overall rank
                                            <br />
                                            in this event
                                        </div>
                                    </div>
                                    <ProgressMeter
                                        pct={topContribution.pct}
                                        height={8}
                                        className="mb-[18px]"
                                        trackClassName="bg-white/[.08]"
                                        fillClassName="bg-gradient-to-r from-lime-deep to-lime-bright"
                                    />
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <ContribStat
                                            label="Current"
                                            value={`${topContribution.current} KM`}
                                        />
                                        <ContribStat
                                            label="Target"
                                            value={`${topContribution.target} KM`}
                                        />
                                        <ContribStat
                                            label="Remaining"
                                            value={`${topContribution.remaining} KM`}
                                            accent
                                        />
                                        <ContribStat
                                            label="Complete"
                                            value={`${topContribution.pct}%`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    <div>
                        <SectionHeader title="Notifications" />
                        <div className="overflow-hidden rounded-[18px] border border-[#DFE3D6] bg-white">
                            {notifications.map((n, i) => {
                                const s =
                                    NOTIF_STYLE[n.type] ?? NOTIF_STYLE.approved;
                                const Icon = s.icon;
                                return (
                                    <div
                                        key={i}
                                        className="flex gap-[13px] border-b border-[#F0F2EA] px-[18px] py-[15px] last:border-b-0"
                                    >
                                        <div
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                                            style={{
                                                background: s.bg,
                                                color: s.fg,
                                            }}
                                        >
                                            <Icon size={17} strokeWidth={2} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-ink">
                                                {n.title}
                                            </div>
                                            <div className="mt-px text-[13px] text-[#6b7261]">
                                                {n.body}
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-semibold whitespace-nowrap text-[#a3a99a]">
                                            {n.time}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function ContribStat({ label, value, accent = false }) {
    return (
        <div>
            <div className="text-[10px] font-bold tracking-[.14em] text-[#717c63] uppercase">
                {label}
            </div>
            <div
                className={`font-display text-2xl font-bold italic ${accent ? 'text-lime' : 'text-white'}`}
            >
                {value}
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout current="dashboard">{page}</AppLayout>;
