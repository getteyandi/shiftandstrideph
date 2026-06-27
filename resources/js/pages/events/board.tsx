import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    MapPin,
    Calendar,
    Users,
    Trophy,
    ArrowLeft,
    Flag,
    User as UserIcon,
    ImageIcon,
    ExternalLink,
    Check,
    X,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/SectionHeader';

interface Entry {
    user_id: number;
    name: string;
    initials: string;
    photo: string | null;
    island?: string | null;
    category: string;
    km: number;
    target?: number;
    pct?: number;
    rank?: number;
}
interface Island {
    name: string;
    total_km: number;
    participants: number;
    runners: Entry[];
}
interface GroupMember {
    name: string;
    initials: string;
    is_captain: boolean;
    status: string;
}
interface Group {
    id: number;
    name: string;
    type: string;
    status: string;
    total_km: number;
    target_km: number;
    pct: number;
    members: GroupMember[];
    pending_invites: string[];
    all_accepted: boolean;
    rank: number;
}

const GROUP_PILL: Record<string, string> = {
    approved: 'bg-[#eef7d8] text-[#5f8c00]',
    pending: 'bg-[#fff3d6] text-[#b07d00]',
    denied: 'bg-[#fde4e1] text-[#c0392b]',
};
interface Progress {
    target_km: number;
    done_km: number;
    remaining_km: number;
    pct: number;
    participants?: number;
}
interface MyProgress extends Progress {
    category: string;
    status: string;
}
interface GroupProgress extends Progress {
    name: string;
    type: string;
}
interface Submission {
    id: number;
    distance: number;
    status: string;
    date: string;
    photo_url: string | null;
    proof_link: string | null;
}
interface EventInfo {
    id: number;
    name: string;
    banner: string | null;
    location: string;
    status: string;
    preset: string;
    description: string;
    dates: string;
}
interface Props {
    mode: 'community' | 'solo' | 'solo-admin' | 'group' | 'group-admin';
    event: EventInfo;
    progress?: Progress;
    ranking?: Entry[];
    islands?: Island[];
    groups?: Group[];
    participants?: Entry[];
    myProgress?: MyProgress | null;
    groupProgress?: GroupProgress | null;
    members?: Entry[];
    mySubmissions?: Submission[];
}

const ISLAND_COLOR: Record<string, string> = {
    Luzon: '#22D3EE',
    Visayas: '#FF8A3D',
    Mindanao: '#A6E212',
};
const SUB_PILL: Record<string, string> = {
    approved: 'bg-[#eef7d8] text-[#5f8c00]',
    completed: 'bg-[#eef7d8] text-[#5f8c00]',
    pending: 'bg-[#fff3d6] text-[#b07d00]',
    rejected: 'bg-[#fde4e1] text-[#c0392b]',
};

function Avatar({
    photo,
    initials,
    ring = '#dfe3d6',
    size = 40,
}: {
    photo: string | null;
    initials: string;
    ring?: string;
    size?: number;
}) {
    return (
        <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-sm font-bold text-white"
            style={{ width: size, height: size, border: `2px solid ${ring}` }}
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

function Bar({ pct }: { pct: number }) {
    return (
        <div className="h-5 w-full overflow-hidden rounded-full bg-[#EEF1E8]">
            <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7fb000,#A6E212)] transition-all"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function ProgressPanel({
    label,
    sub,
    progress,
}: {
    label: string;
    sub: string;
    progress: Progress;
}) {
    return (
        <div className="rounded-[22px] border border-line bg-card p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-[.2em] text-lime-deep">
                        {label}
                    </div>
                    <div className="mt-1 font-display text-2xl font-black italic text-ink">
                        {sub}
                    </div>
                </div>
                <div className="font-display text-5xl font-black italic text-ink">
                    {progress.pct}%
                </div>
            </div>
            <div className="mt-4">
                <Bar pct={progress.pct} />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">
                    {progress.done_km.toLocaleString()} km logged
                </span>
                <span className="text-muted-2">
                    {progress.remaining_km.toLocaleString()} km left to reach the goal of{' '}
                    {progress.target_km.toLocaleString()} km
                </span>
            </div>
        </div>
    );
}

function Submissions({ list }: { list: Submission[] }) {
    return (
        <div>
            <SectionHeader title="Recent Submissions" />
            {list.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-line bg-card py-12 text-center">
                    <Flag className="mx-auto mb-3 text-lime" size={32} />
                    <p className="font-semibold text-ink">
                        No runs submitted for this event yet.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                    {list.map((s) => (
                        <div
                            key={s.id}
                            className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-b-0"
                        >
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cover bg-center text-white/70"
                                style={{
                                    background: s.photo_url
                                        ? `center/cover url(${s.photo_url})`
                                        : 'linear-gradient(135deg,#3a4a22,#1a2010)',
                                }}
                            >
                                {s.photo_url ? null : s.proof_link ? (
                                    <ExternalLink size={16} />
                                ) : (
                                    <ImageIcon size={16} />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-stat text-lg font-bold text-ink">
                                    {s.distance} KM
                                </div>
                                <div className="text-xs text-muted-2">
                                    {s.date}
                                    {s.proof_link && (
                                        <a
                                            href={s.proof_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 font-bold text-lime-deep underline"
                                        >
                                            proof link
                                        </a>
                                    )}
                                </div>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${
                                    SUB_PILL[s.status] ?? SUB_PILL.pending
                                }`}
                            >
                                {s.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MemberRow({
    m,
    meId,
    showBar = true,
}: {
    m: Entry;
    meId?: number;
    showBar?: boolean;
}) {
    const me = m.user_id === meId;
    const pct = m.target ? Math.min(100, Math.round((m.km / m.target) * 100)) : 0;
    return (
        <div
            className={`flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0 ${
                me ? 'bg-[#F7FCEB]' : ''
            }`}
        >
            <span
                className={`w-7 text-center font-display text-xl font-black italic ${
                    (m.rank ?? 0) <= 3 ? 'text-lime-deep' : 'text-muted'
                }`}
            >
                {m.rank}
            </span>
            <Avatar
                photo={m.photo}
                initials={m.initials}
                ring={(m.rank ?? 0) <= 3 ? '#A6E212' : '#dfe3d6'}
            />
            <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold text-ink">
                    {m.name}
                    {me && (
                        <span className="ml-2 text-xs font-bold text-lime-deep">
                            You
                        </span>
                    )}
                </div>
                <div className="text-xs text-muted-2">{m.category}</div>
            </div>
            {showBar && m.target ? (
                <div className="hidden w-32 sm:block">
                    <div className="mb-1 text-right text-[11px] font-semibold text-muted">
                        {pct}%
                    </div>
                    <Bar pct={pct} />
                </div>
            ) : null}
            <div className="font-display text-xl font-black italic text-ink">
                {m.km}
                <span className="ml-1 text-[11px] font-bold not-italic text-muted">
                    KM
                </span>
            </div>
        </div>
    );
}

export default function Board(props: Props) {
    const { event, mode } = props;
    const { auth } = usePage().props as any;
    const meId = auth?.user?.id;
    const backHref =
        auth?.user?.role === 'admin' ? '/admin/events' : '/events';

    return (
        <div className="space-y-7">
            <Head title={`${event.name} · Live Board`} />

            <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-2 transition hover:text-lime-deep"
            >
                <ArrowLeft size={16} />
                Back to events
            </Link>

            {/* HERO */}
            <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">
                {event.banner && (
                    <img
                        src={`/storage/${event.banner}`}
                        alt={event.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-30"
                    />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,8,.4),rgba(9,11,8,.85))]" />
                <div className="relative">
                    <span className="inline-flex rounded-full bg-lime/15 px-3 py-1 text-xs font-bold uppercase tracking-[.1em] text-lime">
                        {event.preset} · Live Board
                    </span>
                    <h1 className="mt-3 font-display text-[clamp(30px,5vw,52px)] font-black italic uppercase leading-[.9] text-white">
                        {event.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#cdd3c3]">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin size={15} />
                            {event.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar size={15} />
                            {event.dates}
                        </span>
                    </div>
                </div>
            </div>

            {/* ========================= COMMUNITY ========================= */}
            {mode === 'community' && props.progress && (
                <>
                    <ProgressPanel
                        label="Collective Progress"
                        sub="All runners combined"
                        progress={props.progress}
                    />
                    {props.islands && (
                        <div>
                            <SectionHeader title="Ranking per Island" />
                            <div className="grid gap-5 md:grid-cols-3">
                                {props.islands.map((isl) => {
                                    const color =
                                        ISLAND_COLOR[isl.name] ?? '#A6E212';
                                    return (
                                        <div
                                            key={isl.name}
                                            className="rounded-[20px] border border-line bg-card p-5"
                                            style={{
                                                borderTop: `4px solid ${color}`,
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-display text-xl font-black italic uppercase text-ink">
                                                    {isl.name}
                                                </h3>
                                                <span
                                                    className="font-display text-lg font-black italic"
                                                    style={{ color }}
                                                >
                                                    {isl.total_km.toLocaleString()}{' '}
                                                    KM
                                                </span>
                                            </div>
                                            <div className="mb-3 text-xs text-muted-2">
                                                {isl.participants} runners
                                            </div>
                                            <ul className="space-y-2">
                                                {isl.runners.map((r) => (
                                                    <li
                                                        key={r.user_id}
                                                        className="flex items-center gap-2.5"
                                                    >
                                                        <span className="w-4 text-center font-display text-sm font-black italic text-muted">
                                                            {r.rank}
                                                        </span>
                                                        <Avatar
                                                            photo={r.photo}
                                                            initials={
                                                                r.initials
                                                            }
                                                            ring={color}
                                                        />
                                                        <span className="flex-1 truncate text-sm font-semibold text-ink">
                                                            {r.name}
                                                        </span>
                                                        <span className="font-stat text-sm font-bold text-ink">
                                                            {r.km}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {props.ranking && (
                        <div>
                            <SectionHeader
                                title="Event Ranking"
                                aside={
                                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                                        <Trophy size={15} />
                                        Top {props.ranking.length}
                                    </span>
                                }
                            />
                            <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                                {props.ranking.map((r) => (
                                    <MemberRow
                                        key={r.user_id}
                                        m={r}
                                        meId={meId}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ============================ SOLO ============================ */}
            {mode === 'solo' && (
                <>
                    {props.myProgress ? (
                        <ProgressPanel
                            label="Your Progress"
                            sub={`${props.myProgress.category} · ${props.myProgress.status}`}
                            progress={props.myProgress}
                        />
                    ) : (
                        <div className="rounded-[22px] border border-dashed border-line bg-card py-12 text-center">
                            <UserIcon
                                className="mx-auto mb-3 text-lime"
                                size={34}
                            />
                            <p className="font-semibold text-ink">
                                You haven't joined this event yet.
                            </p>
                            <Link
                                href={`/events/${event.id}`}
                                className="mt-3 inline-flex rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-[#12150d]"
                            >
                                Join Event
                            </Link>
                        </div>
                    )}
                    {props.myProgress && (
                        <Submissions list={props.mySubmissions ?? []} />
                    )}
                </>
            )}

            {/* ========================= SOLO (admin) ===================== */}
            {mode === 'solo-admin' && (
                <div>
                    <SectionHeader
                        title="Participant Progress"
                        aside={
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                                <Users size={15} />
                                {props.participants?.length ?? 0} runners
                            </span>
                        }
                    />
                    {props.participants && props.participants.length > 0 ? (
                        <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                            {props.participants.map((p) => (
                                <MemberRow
                                    key={p.user_id}
                                    m={{
                                        ...p,
                                        rank: undefined,
                                    }}
                                    meId={meId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[20px] border border-dashed border-line bg-card py-14 text-center">
                            <Users className="mx-auto mb-3 text-lime" size={34} />
                            <p className="font-semibold text-ink">
                                No participants with progress yet.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ============================ GROUP ========================== */}
            {mode === 'group' && (
                <>
                    {props.groupProgress ? (
                        <>
                            <ProgressPanel
                                label="Group Progress"
                                sub={`${props.groupProgress.name} · ${props.groupProgress.type}`}
                                progress={props.groupProgress}
                            />
                            <div>
                                <SectionHeader
                                    title="Team Members"
                                    aside={
                                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                                            <Trophy size={15} />
                                            Ranked by contribution
                                        </span>
                                    }
                                />
                                <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                                    {(props.members ?? []).map((m) => (
                                        <MemberRow
                                            key={m.user_id}
                                            m={m}
                                            meId={meId}
                                            showBar={false}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Submissions list={props.mySubmissions ?? []} />
                        </>
                    ) : (
                        <div className="rounded-[22px] border border-dashed border-line bg-card py-12 text-center">
                            <Users className="mx-auto mb-3 text-lime" size={34} />
                            <p className="font-semibold text-ink">
                                You're not in a team for this event yet.
                            </p>
                            <Link
                                href={`/events/${event.id}`}
                                className="mt-3 inline-flex rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-[#12150d]"
                            >
                                Join Event
                            </Link>
                        </div>
                    )}
                </>
            )}

            {/* ======================== GROUP (admin) ===================== */}
            {mode === 'group-admin' && (
                <div>
                    <SectionHeader title="Team Standings" />
                    {props.groups && props.groups.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {props.groups.map((g) => (
                                <div
                                    key={g.id}
                                    className="rounded-[18px] border border-line bg-card p-5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-display text-xl font-black italic text-ink">
                                            #{g.rank} {g.name}
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                GROUP_PILL[g.status] ??
                                                GROUP_PILL.pending
                                            }`}
                                        >
                                            {g.status}
                                        </span>
                                    </div>
                                    <div className="mt-1 font-stat text-2xl font-bold text-lime-deep">
                                        {g.total_km} KM ·{' '}
                                        <span className="text-sm capitalize text-muted">
                                            {g.type}
                                        </span>
                                    </div>

                                    {/* Combined team progress toward the shared goal */}
                                    <div className="mt-3">
                                        <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted">
                                            <span>
                                                {g.total_km} / {g.target_km} km
                                            </span>
                                            <span>{g.pct}%</span>
                                        </div>
                                        <Bar pct={g.pct} />
                                    </div>

                                    {/* Members who have joined / accepted */}
                                    <div className="mt-3 space-y-1.5">
                                        {g.members.map((m, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Check
                                                    size={14}
                                                    className="text-lime-deep"
                                                />
                                                <span className="font-semibold text-ink">
                                                    {m.name}
                                                </span>
                                                {m.is_captain && (
                                                    <span className="rounded-full bg-[#eef7d8] px-2 py-0.5 text-[9px] font-bold uppercase text-[#5f8c00]">
                                                        Captain
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {g.pending_invites.map((name, i) => (
                                            <div
                                                key={`p${i}`}
                                                className="flex items-center gap-2 text-sm text-muted-2"
                                            >
                                                <span className="inline-block h-3.5 w-3.5 rounded-full border border-[#d9b94a]" />
                                                <span>{name}</span>
                                                <span className="rounded-full bg-[#fff3d6] px-2 py-0.5 text-[9px] font-bold uppercase text-[#b07d00]">
                                                    Invite pending
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {g.status === 'pending' && (
                                        <div className="mt-4">
                                            {!g.all_accepted && (
                                                <p className="mb-2 text-xs font-semibold text-[#b07d00]">
                                                    {g.pending_invites.length}{' '}
                                                    invited runner
                                                    {g.pending_invites.length > 1
                                                        ? 's have'
                                                        : ' has'}{' '}
                                                    not accepted yet.
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={!g.all_accepted}
                                                    onClick={() =>
                                                        router.patch(
                                                            `/admin/groups/${g.id}/approve`,
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                    title={
                                                        g.all_accepted
                                                            ? undefined
                                                            : 'Every invited runner must accept first'
                                                    }
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-lime px-3 py-2 text-sm font-bold text-[#12150d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <Check size={15} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                'Deny this team?',
                                                            )
                                                        )
                                                            router.patch(
                                                                `/admin/groups/${g.id}/deny`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                    }}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <X size={15} />
                                                    Deny
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[20px] border border-dashed border-line bg-card py-14 text-center">
                            <Users className="mx-auto mb-3 text-lime" size={34} />
                            <p className="font-semibold text-ink">
                                No teams yet.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

Board.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
