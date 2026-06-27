import { Head } from '@inertiajs/react';

import { Clock3 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import RunnerHero from '@/components/RunnerHero';
import SectionHeader from '@/components/SectionHeader';
import ActiveEventCard from '@/components/ActiveEventCard';
import ProgressMeter from '@/components/ProgressMeter';

/* ---- prop shapes (rename to match your controller payloads) -------------- */
interface Runner {
    name: string;
    initials: string;
    runner_code: string;
    verified?: boolean;
    rank?: number | null;
    total_distance: number | string;
    events_completed: number | string;
}
interface Registration {
    id: number | string;
    event_id?: number | string;
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
    banner?: string | null;
    is_highlighted?: boolean;
    preset?: 'solo' | 'community' | 'group';
}
interface TopContribution {
    event_name: string;
    target_km: number;
    rank: number;
    current_km: number;
    remaining_km: number;
    pct: number;
}

interface PendingRegistration {
    id: number | string;
    event_name: string;
    category_name: string;
    target_km: number;
    bib_number: string;
    requested_at: string;
}

interface DashboardProps {
    runner: Runner;
    personal: { label: string; value: string | number }[];
    activeRegistrations: Registration[];
    pendingRegistrations: PendingRegistration[];
    topContribution?: TopContribution | null;
}

export default function Dashboard({
    runner,
    personal,
    activeRegistrations,
    pendingRegistrations,
    topContribution,
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

                        {(() => {
                            const spotlight = activeRegistrations.find(
                                (r) => r.is_highlighted,
                            );
                            const others = spotlight
                                ? activeRegistrations.filter(
                                      (r) => r.id !== spotlight.id,
                                  )
                                : activeRegistrations;

                            return (
                                <div className="space-y-[18px]">
                                    {spotlight && (
                                        <ActiveEventCard
                                            registration={spotlight}
                                            spotlight
                                        />
                                    )}

                                    {others.length > 0 && (
                                        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-[repeat(auto-fit,minmax(330px,1fr))] md:gap-[18px] md:overflow-visible">
                                            {others.map((r) => (
                                                <ActiveEventCard
                                                    key={r.id}
                                                    registration={r}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Pending approval — below active events */}
                    {pendingRegistrations.length > 0 && (
                        <div className="col-span-full">
                            <SectionHeader
                                title="Pending Approval"
                                aside={
                                    <span className="text-[13px] font-semibold text-muted">
                                        {pendingRegistrations.length} awaiting
                                    </span>
                                }
                            />
                            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
                                {pendingRegistrations.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-4 rounded-[18px] border border-[#F2E2B8] bg-[#FFFBEF] p-[18px]"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#FEF3C7] text-[#B07D00]">
                                            <Clock3 size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[15px] font-bold text-ink">
                                                {p.event_name}
                                            </div>
                                            <div className="text-[12.5px] text-muted">
                                                {p.category_name} · {p.target_km}{' '}
                                                KM · Bib {p.bib_number}
                                            </div>
                                            <div className="mt-0.5 text-[11px] font-semibold text-[#B07D00]">
                                                Requested {p.requested_at}
                                            </div>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.05em] text-[#92600A]">
                                            Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
