import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Mail,
    MapPin,
    Cake,
    Shield,
    BadgeCheck,
    Footprints,
    ClipboardList,
    Package,
    ExternalLink,
    CalendarDays,
} from 'lucide-react';

import SectionHeader from '@/components/SectionHeader';
import AppLayout from '@/layouts/app-layout';

interface UserInfo {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    initials: string;
    email: string;
    runner_code: string | null;
    profile_photo: string | null;
    status: string;
    role: string;
    verified: boolean;
    gender: string | null;
    birthday: string | null;
    age: number | null;
    province: string | null;
    city: string | null;
    island: string | null;
    address: string | null;
    created_at: string | null;
}
interface Registration {
    id: number;
    event_name: string | null;
    category_name: string | null;
    target_km: number;
    completed_km: number;
    bib_number: string;
    status: string;
    joined_at: string | null;
}
interface Run {
    id: number;
    distance: number;
    status: string;
    ran_on: string | null;
    submitted_at: string | null;
    notes: string | null;
    photo_url: string | null;
    proof_link: string | null;
    events: string[];
}
interface ShipmentRow {
    id: number;
    tracking_id: string;
    item: string;
    courier: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
}

interface Props {
    user: UserInfo;
    registrations: Registration[];
    runs: Run[];
    shipments: ShipmentRow[];
}

const pill = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved':
        case 'completed':
        case 'active':
        case 'delivered':
            return 'bg-lime text-[#12150d]';
        case 'pending':
        case 'processing':
        case 'shipped':
            return 'bg-[#FEF3C7] text-[#92600A]';
        case 'rejected':
        case 'suspended':
            return 'bg-[#FEE2E2] text-[#B91C1C]';
        default:
            return 'bg-[#E4E8DD] text-[#5A6152]';
    }
};

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#92A084]">
                {label}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
        </div>
    );
}

export default function Show({ user, registrations, runs, shipments }: Props) {
    return (
        <>
            <Head title={user.full_name} />

            <div className="space-y-6">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink"
                >
                    <ArrowLeft size={16} />
                    Back to runners
                </Link>

                {/* PROFILE HEADER */}
                <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-lime bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-2xl font-bold text-white">
                            {user.profile_photo ? (
                                <img
                                    src={`/storage/${user.profile_photo}`}
                                    alt={user.full_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                user.initials
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="font-display text-4xl font-black italic text-white">
                                    {user.full_name}
                                </h1>
                                {user.verified && (
                                    <BadgeCheck size={20} className="text-lime" />
                                )}
                                {user.role === 'admin' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-lime/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-lime">
                                        <Shield size={11} />
                                        Admin
                                    </span>
                                )}
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${pill(
                                        user.status,
                                    )}`}
                                >
                                    {user.status}
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#98A08E]">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail size={14} />
                                    {user.email}
                                </span>
                                {user.runner_code && (
                                    <span className="font-semibold text-lime">
                                        {user.runner_code}
                                    </span>
                                )}
                                {(user.city || user.province) && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin size={14} />
                                        {[user.city, user.province]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </span>
                                )}
                                {user.birthday && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Cake size={14} />
                                        {user.birthday}
                                        {user.age !== null && ` (${user.age})`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4">
                        <Detail label="Gender" value={user.gender ?? '—'} />
                        <Detail label="Island" value={user.island ?? '—'} />
                        <Detail label="Address" value={user.address ?? '—'} />
                        <Detail label="Joined" value={user.created_at ?? '—'} />
                    </div>
                </div>

                {/* JOINED EVENTS */}
                <div>
                    <SectionHeader
                        title="Events Joined"
                        aside={
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                                <ClipboardList size={15} />
                                {registrations.length}
                            </span>
                        }
                    />
                    {registrations.length === 0 ? (
                        <Empty text="Not registered to any events." />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {registrations.map((r) => (
                                <div
                                    key={r.id}
                                    className="rounded-2xl border border-line bg-card p-4"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="truncate font-display text-lg font-black italic text-ink">
                                                {r.event_name ?? '—'}
                                            </div>
                                            <div className="text-sm text-muted">
                                                {r.category_name} · Bib{' '}
                                                {r.bib_number}
                                            </div>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${pill(
                                                r.status,
                                            )}`}
                                        >
                                            {r.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-ink">
                                        {r.completed_km}
                                        {r.target_km > 0
                                            ? ` / ${r.target_km} km`
                                            : ' km'}
                                    </div>
                                    <div className="mt-0.5 text-xs text-muted-2">
                                        Joined {r.joined_at}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RUN SUBMISSIONS */}
                <div>
                    <SectionHeader
                        title="Run Submissions"
                        aside={
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                                <Footprints size={15} />
                                {runs.length}
                            </span>
                        }
                    />
                    {runs.length === 0 ? (
                        <Empty text="No runs submitted." />
                    ) : (
                        <div className="space-y-3">
                            {runs.map((run) => (
                                <div
                                    key={run.id}
                                    className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4"
                                >
                                    <div
                                        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cover bg-center text-white/70"
                                        style={{
                                            background: run.photo_url
                                                ? `center/cover url(${run.photo_url})`
                                                : 'linear-gradient(135deg,#3a4a22,#1a2010)',
                                        }}
                                    >
                                        {run.photo_url ? null : (
                                            <Footprints size={20} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-2xl font-black italic text-ink">
                                                {run.distance}
                                                <span className="ml-1 text-xs font-bold not-italic text-muted">
                                                    KM
                                                </span>
                                            </span>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${pill(
                                                    run.status,
                                                )}`}
                                            >
                                                {run.status}
                                            </span>
                                        </div>
                                        {run.events.length > 0 && (
                                            <div className="mt-1 truncate text-xs font-semibold text-[#3A4034]">
                                                {run.events.join(', ')}
                                            </div>
                                        )}
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-2">
                                            {run.ran_on && (
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarDays size={12} />
                                                    Ran {run.ran_on}
                                                </span>
                                            )}
                                            <span>
                                                Submitted {run.submitted_at}
                                            </span>
                                            {run.proof_link && (
                                                <a
                                                    href={run.proof_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 font-bold text-lime-deep underline"
                                                >
                                                    <ExternalLink size={11} />
                                                    Proof
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SHIPMENTS */}
                <div>
                    <SectionHeader
                        title="Shipments"
                        aside={
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                                <Package size={15} />
                                {shipments.length}
                            </span>
                        }
                    />
                    {shipments.length === 0 ? (
                        <Empty text="No shipments for this runner." />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {shipments.map((s) => (
                                <div
                                    key={s.id}
                                    className="rounded-2xl border border-line bg-card p-4"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="truncate font-bold text-ink">
                                                {s.item}
                                            </div>
                                            <div className="text-xs text-muted">
                                                {s.tracking_id}
                                                {s.courier && ` · ${s.courier}`}
                                            </div>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${pill(
                                                s.status,
                                            )}`}
                                        >
                                            {s.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-2">
                                        {s.shipped_at && (
                                            <span>Shipped {s.shipped_at}</span>
                                        )}
                                        {s.delivered_at && (
                                            <span>
                                                Delivered {s.delivered_at}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-line bg-card py-10 text-center text-sm text-muted">
            {text}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout active="users">{page}</AppLayout>
);
