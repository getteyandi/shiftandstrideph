import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Check, Upload, ImageIcon } from '@/lib/icons';
import {
    Undo2,
    Users,
    BarChart3,
    User as UserIcon,
    Crown,
    UserPlus,
    X,
    Mail,
    ExternalLink,
    Award,
} from 'lucide-react';
import EventCardLarge from '@/components/EventCardLarge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Category {
    id: number;
    name: string;
    target_km: number;
    ranking_enabled: boolean;
}
interface Group {
    id: number;
    name: string;
    type: string;
    status: string;
    total_km: number;
    members: string[];
}
interface Member {
    name: string;
    initials: string;
    photo: string | null;
    is_captain: boolean;
}
interface MyTeam {
    id: number;
    name: string;
    type: string;
    status: 'pending' | 'approved' | 'denied';
    max: number | null;
    is_captain: boolean;
    members: Member[];
    invitations: { id: number; name: string }[];
}
interface Invitation {
    id: number;
    group_name: string;
    type: string;
    captain: string;
}
interface Candidate {
    id: number;
    name: string;
    runner_code: string | null;
}
interface Event {
    id: number;
    name: string;
    description: string;
    banner?: string | null;
    location: string;
    dates: string;
    status: string;
    preset: 'solo' | 'community' | 'group';
    categories: Category[];
}
interface MyRegistration {
    id: number;
    category_id: number;
    status: string;
    rejection_reason: string | null;
    bib_number: string;
    completed_km: number;
    group: { name: string; type: string } | null;
}
interface Submission {
    id: number;
    distance: number;
    status: string;
    date: string;
    photo_url: string | null;
    proof_link: string | null;
    rejection_reason: string | null;
}
interface Props {
    event: Event;
    myRegistration: MyRegistration | null;
    mySubmissions: Submission[];
    groups: Group[];
    myTeam: MyTeam | null;
    inviteCandidates: Candidate[];
    myInvitations: Invitation[];
}

const STATUS_PILL: Record<string, string> = {
    approved: 'bg-[#eef7d8] text-[#5f8c00]',
    completed: 'bg-[#eef7d8] text-[#5f8c00]',
    pending: 'bg-[#fff3d6] text-[#b07d00]',
    rejected: 'bg-[#fde4e1] text-[#c0392b]',
    denied: 'bg-[#fde4e1] text-[#c0392b]',
};

export default function Show({
    event,
    myRegistration,
    mySubmissions,
    groups,
    myTeam,
    inviteCandidates,
    myInvitations,
}: Props) {
    const isGroup = event.preset === 'group';
    const showBoard = event.preset !== 'solo';
    // A rejected registration is treated as "not joined" so the runner can rejoin.
    const isRejected = myRegistration?.status === 'rejected';
    const joined = !!myRegistration && !isRejected;

    const { data, setData, post, processing } = useForm({
        event_category_id: 0,
        group_name: '',
        group_type: 'group' as 'solo' | 'duo' | 'group',
    });
    const [picked, setPicked] = useState(0);
    const [candidate, setCandidate] = useState('');

    const join = () => post(`/events/${event.id}/join`);

    const undo = () => {
        if (!myRegistration) return;
        if (confirm('Undo your registration for this event?')) {
            router.delete(`/registrations/${myRegistration.id}`, {
                preserveScroll: true,
            });
        }
    };

    const invite = () => {
        if (!myTeam || !candidate) return;
        router.post(
            `/groups/${myTeam.id}/invite`,
            { user_id: candidate },
            { preserveScroll: true, onSuccess: () => setCandidate('') },
        );
    };

    const cancelInvite = (id: number) =>
        router.delete(`/group-invitations/${id}`, { preserveScroll: true });

    // Accepting just joins the captain's team & category — no category prompt.
    const accept = (id: number) =>
        router.post(`/group-invitations/${id}/accept`, {});

    const decline = (id: number) =>
        router.post(
            `/group-invitations/${id}/decline`,
            {},
            { preserveScroll: true },
        );

    const canJoin =
        picked > 0 && (!isGroup || data.group_name.trim().length > 0);

    return (
        <div>
            <Head title={event.name} />

            <div className="animate-[floatup_.4s_ease_both]">
                <EventCardLarge
                    id={event.id}
                    name={event.name}
                    location={event.location}
                    dates={event.dates}
                    status={event.status}
                    description={event.description}
                />

                {/* preset + board */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold uppercase text-lime">
                        {event.preset === 'solo' ? (
                            <UserIcon size={13} />
                        ) : (
                            <Users size={13} />
                        )}
                        {event.preset} Run
                    </span>
                    {showBoard && (
                        <Link
                            href={`/events/${event.id}/board`}
                            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 text-sm font-bold text-ink transition hover:border-lime hover:text-lime-deep"
                        >
                            <BarChart3 size={15} />
                            Live Board
                        </Link>
                    )}
                </div>

                {/* TEAM INVITATIONS (invited, not yet joined) */}
                {!joined && myInvitations.length > 0 && (
                    <section className="mt-8 space-y-3">
                        <h2 className="font-display text-3xl font-extrabold uppercase italic text-ink">
                            Team Invitations
                        </h2>
                        {myInvitations.map((inv) => (
                            <div
                                key={inv.id}
                                className="rounded-[18px] border border-lime bg-[#F7FCEB] p-5"
                            >
                                <div className="flex items-center gap-2 font-display text-xl font-black italic text-ink">
                                    <Mail size={18} className="text-lime-deep" />
                                    {inv.captain} invited you to{' '}
                                    {inv.group_name}
                                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase text-lime-deep">
                                        {inv.type}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-[#4b5340]">
                                    Join {inv.captain}'s team for this event.
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => accept(inv.id)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-lime transition hover:bg-lime hover:text-ink"
                                    >
                                        <Check size={16} />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => decline(inv.id)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                    >
                                        <X size={16} />
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* JOINED PANEL */}
                {joined ? (
                    <section className="mt-8 rounded-[20px] border border-lime bg-[#F7FCEB] p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 font-display text-2xl font-black italic text-ink">
                                    <Check size={22} className="text-lime-deep" />
                                    You're in!
                                </div>
                                <div className="mt-1 text-sm text-[#4b5340]">
                                    Bib {myRegistration.bib_number} ·{' '}
                                    {myRegistration.status}
                                </div>
                            </div>
                            {myRegistration.status === 'completed' ? (
                                <a
                                    href={`/certificates/${myRegistration.id}/download`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-lime transition hover:bg-lime hover:text-ink"
                                >
                                    <Award size={16} />
                                    Download certificate
                                </a>
                            ) : (
                                <button
                                    onClick={undo}
                                    className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                >
                                    <Undo2 size={16} />
                                    Undo
                                </button>
                            )}
                        </div>
                    </section>
                ) : (
                    /* JOIN FLOW */
                    <section className="mt-8 space-y-6">
                        {isRejected && (
                            <div className="rounded-[18px] border border-red-300 bg-[#fdecea] p-5">
                                <div className="flex items-center gap-2 font-display text-xl font-black italic text-[#c0392b]">
                                    <X size={18} />
                                    Your previous registration was rejected
                                </div>
                                {myRegistration?.rejection_reason && (
                                    <p className="mt-1 text-sm font-semibold text-[#8c2f25]">
                                        {myRegistration.rejection_reason}
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-[#8c2f25]">
                                    No worries — you can join again below.
                                </p>
                            </div>
                        )}

                        <div>
                            <h2 className="font-display text-3xl font-extrabold uppercase italic text-ink">
                                Choose Your Category
                            </h2>
                            <p className="mt-1 text-sm text-muted-2">
                                One category per event.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {event.categories.map((c) => {
                                const on = picked === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            setPicked(c.id);
                                            setData('event_category_id', c.id);
                                        }}
                                        className={`rounded-[18px] border p-5 text-left transition ${
                                            on
                                                ? 'border-lime bg-[#F7FCEB] ring-2 ring-lime/30'
                                                : 'border-line bg-card hover:border-lime'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-display text-2xl font-bold italic text-ink">
                                                {c.name}
                                            </h3>
                                            {c.ranking_enabled && (
                                                <span className="rounded-full bg-lime px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink">
                                                    Ranked
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-2">
                                            Complete{' '}
                                            {Math.round(
                                                Number(c.target_km) * 100,
                                            ) / 100}{' '}
                                            KM
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {isGroup && (
                            <div className="rounded-[20px] border border-line bg-card p-6">
                                <h3 className="flex items-center gap-2 font-display text-2xl font-bold italic text-ink">
                                    <Crown size={20} className="text-lime-deep" />
                                    Start Your Team
                                </h3>
                                <p className="mt-1 mb-4 text-sm text-muted-2">
                                    You'll be the captain. Invite your teammates
                                    after joining — the admin approves the team.
                                </p>
                                <input
                                    value={data.group_name}
                                    onChange={(e) =>
                                        setData('group_name', e.target.value)
                                    }
                                    placeholder="Team name (e.g. Trailblazers)"
                                    className="w-full rounded-xl border border-line bg-card px-4 py-3 text-ink outline-none transition focus:border-lime"
                                />
                                <div className="mt-3 flex gap-2">
                                    {(['solo', 'duo', 'group'] as const).map(
                                        (t) => {
                                            const on = data.group_type === t;
                                            const cap =
                                                t === 'solo'
                                                    ? 'just you'
                                                    : t === 'duo'
                                                      ? 'max 2'
                                                      : 'no limit';
                                            return (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() =>
                                                        setData('group_type', t)
                                                    }
                                                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold capitalize transition ${
                                                        on
                                                            ? 'border-lime bg-[#F7FCEB] text-ink'
                                                            : 'border-line text-muted hover:border-lime'
                                                    }`}
                                                >
                                                    {t}{' '}
                                                    <span className="text-xs text-muted">
                                                        ({cap})
                                                    </span>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={join}
                            disabled={processing || !canJoin}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-4 font-display text-lg font-extrabold uppercase italic text-lime transition hover:bg-lime hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isGroup ? 'Create Team & Join' : 'Join Event'}
                        </button>
                    </section>
                )}

                {/* MY TEAM (captain tools) */}
                {joined && myTeam && (
                    <section className="mt-8 rounded-[20px] border border-line bg-card p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="flex items-center gap-2 font-display text-2xl font-black italic text-ink">
                                <Users size={22} className="text-lime-deep" />
                                {myTeam.name}
                                <span className="text-sm font-semibold capitalize text-muted">
                                    · {myTeam.type}
                                </span>
                            </h2>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                    STATUS_PILL[myTeam.status] ??
                                    STATUS_PILL.pending
                                }`}
                            >
                                {myTeam.status === 'pending'
                                    ? 'Awaiting admin approval'
                                    : myTeam.status}
                            </span>
                        </div>

                        {/* members */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            {myTeam.members.map((m, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 rounded-xl border border-line px-3 py-2"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] text-xs font-bold text-white">
                                        {m.photo ? (
                                            <img
                                                src={`/storage/${m.photo}`}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            m.initials
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-ink">
                                        {m.name}
                                    </span>
                                    {m.is_captain && (
                                        <Crown
                                            size={14}
                                            className="text-lime-deep"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* captain: invite (only while there's an open slot) */}
                        {myTeam.is_captain &&
                            myTeam.status === 'pending' &&
                            (myTeam.max === null ||
                                myTeam.members.length +
                                    myTeam.invitations.length <
                                    myTeam.max) && (
                            <div className="mt-5 border-t border-line pt-5">
                                <div className="mb-2 text-sm font-bold text-ink">
                                    Invite runners ({myTeam.members.length +
                                        myTeam.invitations.length}
                                    /{myTeam.max ?? '∞'})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="min-w-[220px] flex-1">
                                        <Select
                                            value={candidate}
                                            onValueChange={setCandidate}
                                        >
                                            <SelectTrigger className="w-full rounded-xl border-line bg-card py-5 text-ink">
                                                <SelectValue placeholder="Choose a runner to invite" />
                                            </SelectTrigger>
                                            <SelectContent className="border-line bg-card">
                                                {inviteCandidates.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={String(c.id)}
                                                    >
                                                        {c.name}
                                                        {c.runner_code
                                                            ? ` (${c.runner_code})`
                                                            : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <button
                                        onClick={invite}
                                        disabled={!candidate}
                                        className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3 font-bold text-[#12150d] transition hover:brightness-95 disabled:opacity-50"
                                    >
                                        <UserPlus size={17} />
                                        Invite
                                    </button>
                                </div>

                                {myTeam.invitations.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wide text-muted">
                                            Pending invites
                                        </div>
                                        {myTeam.invitations.map((inv) => (
                                            <div
                                                key={inv.id}
                                                className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5"
                                            >
                                                <span className="text-sm font-semibold text-ink">
                                                    {inv.name}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        cancelInvite(inv.id)
                                                    }
                                                    className="text-xs font-bold text-red-600 hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* TEAM STANDINGS */}
                {isGroup && groups.length > 0 && (
                    <section className="mt-10">
                        <h2 className="mb-5 font-display text-3xl font-extrabold uppercase italic text-ink">
                            Teams
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[...groups]
                                .sort((a, b) => b.total_km - a.total_km)
                                .map((g) => (
                                    <div
                                        key={g.id}
                                        className="rounded-[18px] border border-line bg-card p-5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-display text-xl font-black italic text-ink">
                                                {g.name}
                                            </span>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                    STATUS_PILL[g.status] ??
                                                    STATUS_PILL.pending
                                                }`}
                                            >
                                                {g.status}
                                            </span>
                                        </div>
                                        <div className="mt-1 font-stat text-2xl font-bold text-lime-deep">
                                            {g.total_km} KM
                                        </div>
                                        <div className="mt-2 text-xs text-muted-2">
                                            {g.members.join(', ')}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}

                {/* MY SUBMISSIONS */}
                {joined && (
                    <section className="mt-10">
                        <h2 className="mb-5 font-display text-3xl font-extrabold uppercase italic text-ink">
                            My Submissions
                        </h2>
                        {mySubmissions.length === 0 ? (
                            <div className="rounded-[20px] border border-dashed border-line bg-card py-12 text-center">
                                <Upload
                                    className="mx-auto mb-3 text-lime"
                                    size={32}
                                />
                                <p className="font-semibold text-ink">
                                    No runs submitted for this event yet.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                                {mySubmissions.map((s) => (
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
                                                <ExternalLink size={18} />
                                            ) : (
                                                <ImageIcon size={18} />
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
                                                {s.status === 'rejected' &&
                                                    s.rejection_reason && (
                                                        <span className="text-[#c0392b]">
                                                            {' '}
                                                            · {s.rejection_reason}
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${
                                                STATUS_PILL[s.status] ??
                                                STATUS_PILL.pending
                                            }`}
                                        >
                                            {s.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
