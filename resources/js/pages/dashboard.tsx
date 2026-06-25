import { Head } from '@inertiajs/react';

import { Bell, Check, Award, FileText, Megaphone } from '@/lib/icons';
import { type ComponentType } from 'react';
import AppLayout from '@/layouts/app-layout';
import RunnerHero from '@/components/RunnerHero';
import SectionHeader from '@/components/SectionHeader';
import ActiveEventCard from '@/components/ActiveEventCard';
import ProgressMeter from '@/components/ProgressMeter';
import { LucideIcon } from 'lucide-react';

/* ---- prop shapes (rename to match your controller payloads) -------------- */
interface Runner {
    name: string;
    initials: string;
    runner_code: string;
    verified?: boolean;
    total_distance: number | string;
    events_completed: number | string;
}
interface Registration {
    id: number | string;
    event_name: string;
    category_name: string;
    bib_number: string;
    distance_done: number;
    target_km: number;
    activity_count: number;
    last_activity_at: string;
    ranking_enabled: boolean;
    rank?: number;
    status?: string;
}
interface TopContribution {
    event_name: string;
    target_km: number;
    rank: number;
    current_km: number;
    remaining_km: number;
    pct: number;
}
interface Notification {
    id: number | string;
    type: 'approval' | 'badge' | 'certificate' | 'event' | string;
    title: string;
    body: string;
    time: string;
}

interface DashboardProps {
    runner: Runner;
    personal: { label: string; value: string | number }[];
    activeRegistrations: Registration[];
    topContribution?: TopContribution | null;
    notifications: Notification[];
}

/* Map notification type → icon + swatch (no emoji in chrome, HANDOFF §2). */
const NOTIF_STYLE: Record<
    string,
    {
        icon: LucideIcon;
        bg: string;
        fg: string;
    }
> = {
    approval: { icon: Check, bg: '#eef7d8', fg: '#5f8c00' },
    badge: { icon: Award, bg: '#fdf3d6', fg: '#b8860b' },
    certificate: { icon: FileText, bg: '#e3eefc', fg: '#2563aa' },
    event: { icon: Megaphone, bg: '#f0eafc', fg: '#7c4fc4' },
    default: { icon: Bell, bg: '#eef7d8', fg: '#5f8c00' },
};

export default function Dashboard({
    runner,
    personal,
    activeRegistrations,
    topContribution,
    notifications,
}: DashboardProps) {
    return (
        <div>
            <Head title="Dashboard" />

            <div className="animate-[floatup_.4s_ease_both]">
                <RunnerHero runner={runner} personal={personal} />

                <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-start gap-6">
                    {/* Active events span full width */}
                    <div className="col-span-full">
                        <SectionHeader
                            title="Active Events"
                            aside={
                                <span className="text-[13px] font-semibold text-muted">
                                    {activeRegistrations.length} registrations
                                </span>
                            }
                        />
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-[18px]">
                            {activeRegistrations.map((r) => (
                                <ActiveEventCard key={r.id} registration={r} />
                            ))}
                        </div>
                    </div>

                    {/* Top contribution */}
                    {topContribution ? (
                        <div>
                            <SectionHeader title="Top Contribution" />
                            <div className="relative overflow-hidden rounded-[18px] border border-[#2a3120] bg-[linear-gradient(150deg,#12150d,#0c0f0b)] p-6">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0"
                                    style={{
                                        background:
                                            'radial-gradient(300px 200px at 100% 0,rgba(166,226,18,.18),transparent 60%)',
                                    }}
                                />
                                <div className="relative">
                                    <div className="text-[11px] font-bold tracking-[.2em] text-lime uppercase">
                                        {topContribution.event_name} ·{' '}
                                        {topContribution.target_km} KM
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
                                        size="sm"
                                        onDark
                                        className="mb-[18px]"
                                    />
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <ContribStat
                                            label="Current"
                                            value={`${topContribution.current_km} KM`}
                                        />
                                        <ContribStat
                                            label="Target"
                                            value={`${topContribution.target_km} KM`}
                                        />
                                        <ContribStat
                                            label="Remaining"
                                            value={`${topContribution.remaining_km} KM`}
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
                    ) : null}

                    {/* Notifications */}
                    <div>
                        <SectionHeader title="Notifications" />
                        <div className="overflow-hidden rounded-[18px] border border-line bg-card">
                            {notifications.map((nt) => {
                                const s =
                                    NOTIF_STYLE[nt.type] ?? NOTIF_STYLE.default;
                                const Icon = s.icon;
                                return (
                                    <div
                                        key={nt.id}
                                        className="flex gap-3 border-b border-[#F0F2EA] px-[18px] py-[15px] last:border-b-0"
                                    >
                                        <div
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                                            style={{
                                                background: s.bg,
                                                color: s.fg,
                                            }}
                                        >
                                            <Icon size={17} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-ink">
                                                {nt.title}
                                            </div>
                                            <div className="mt-px text-[13px] text-muted-2">
                                                {nt.body}
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-semibold whitespace-nowrap text-[#a3a99a]">
                                            {nt.time}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContribStat({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div>
            <div className="text-[10px] font-bold tracking-[.14em] text-[#717c63] uppercase">
                {label}
            </div>
            <div
                className={
                    'font-display text-2xl font-bold italic ' +
                    (accent ? 'text-lime' : 'text-white')
                }
            >
                {value}
            </div>
        </div>
    );
}
