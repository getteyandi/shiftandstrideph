import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    Check,
    X,
    Mail,
    MapPin,
    Cake,
    Shield,
    Eye,
    BadgeCheck,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination, { type PaginationLink } from '@/components/Pagination';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface AppUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: 'pending' | 'active' | 'suspended';
    role: 'admin' | 'participant';
    runner_code: string | null;
    profile_photo: string | null;
    verified: boolean;
    gender: string | null;
    province: string | null;
    city: string | null;
    island: string | null;
    address: string | null;
    birthday: string | null;
    created_at: string;
}

const avatarOf = (u: AppUser) =>
    `${u.first_name[0] ?? ''}${u.last_name[0] ?? ''}`.toUpperCase();

const ageFrom = (birthday: string | null) => {
    if (!birthday) return null;
    const diff = Date.now() - new Date(birthday).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}

interface Props {
    users: Paginated<AppUser>;
    counts: Record<string, number>;
    filter: string;
}

const FILTERS = ['all', 'pending', 'active', 'suspended'] as const;

const statusPill = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-lime text-[#12150d]';
        case 'pending':
            return 'bg-[#FEF3C7] text-[#92600A]';
        case 'suspended':
            return 'bg-[#FEE2E2] text-[#B91C1C]';
        default:
            return 'bg-[#E4E8DD] text-[#5A6152]';
    }
};

export default function Index({ users, counts, filter }: Props) {
    const [detail, setDetail] = useState<AppUser | null>(null);
    const [denyTarget, setDenyTarget] = useState<AppUser | null>(null);

    const visible = users.data;

    const setFilter = (status: string) =>
        router.get(
            '/admin/users',
            status === 'all' ? {} : { status },
            { preserveScroll: true, preserveState: true },
        );

    const approve = (id: number) =>
        router.patch(
            `/admin/users/${id}/approve`,
            {},
            { preserveScroll: true },
        );

    const deny = () => {
        if (!denyTarget) return;
        router.patch(
            `/admin/users/${denyTarget.id}/deny`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setDenyTarget(null),
            },
        );
    };

    const location = (u: AppUser) =>
        [u.city, u.province].filter(Boolean).join(', ');

    return (
        <>
            <Head title="Users" />

            <div className="space-y-8">
                {/* HERO */}
                <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />
                    <div className="relative">
                        <p className="mb-2 text-xs font-bold tracking-[.28em] uppercase text-lime">
                            Administration
                        </p>
                        <h1 className="font-display text-5xl font-black italic text-white">
                            RUNNERS
                        </h1>
                        <p className="mt-3 max-w-xl text-sm text-[#98A08E]">
                            Approve new sign-ups or deny accounts that don't
                            belong.
                        </p>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-wrap gap-3">
                    {FILTERS.map((f) => {
                        const on = filter === f;
                        const count = counts[f] ?? 0;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${
                                    on
                                        ? 'bg-black text-lime'
                                        : 'border border-line bg-card text-muted hover:border-lime hover:text-lime'
                                }`}
                            >
                                {f}
                                <span className="ml-2 opacity-70">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* LIST */}
                {visible.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-line bg-card py-20 text-center">
                        <Users className="mx-auto mb-4 text-lime" size={40} />
                        <h3 className="text-lg font-bold">
                            No {filter === 'all' ? '' : filter} runners
                        </h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visible.map((u) => (
                            <div
                                key={u.id}
                                className="flex flex-col gap-4 rounded-3xl border border-[#dde3d5] bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-base font-bold text-white">
                                        {u.profile_photo ? (
                                            <img
                                                src={`/storage/${u.profile_photo}`}
                                                alt={`${u.first_name} ${u.last_name}`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            avatarOf(u)
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-xl font-black italic text-ink">
                                                {u.first_name} {u.last_name}
                                            </span>
                                            {u.role === 'admin' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#12150d] px-2.5 py-0.5 text-[10px] font-bold uppercase text-lime">
                                                    <Shield size={11} />
                                                    Admin
                                                </span>
                                            )}
                                            {u.runner_code && (
                                                <span className="text-xs font-semibold text-muted">
                                                    {u.runner_code}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#70766a]">
                                            <span className="inline-flex items-center gap-1">
                                                <Mail size={13} />
                                                {u.email}
                                            </span>
                                            {location(u) && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={13} />
                                                    {location(u)}
                                                </span>
                                            )}
                                            {u.gender && (
                                                <span>{u.gender}</span>
                                            )}
                                            {u.birthday && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Cake size={13} />
                                                    {new Date(
                                                        u.birthday,
                                                    ).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:flex-col md:items-end lg:flex-row lg:items-center">
                                    <button
                                        type="button"
                                        onClick={() => setDetail(u)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-[#5A6152] transition hover:border-lime hover:text-ink"
                                    >
                                        <Eye size={15} />
                                        Details
                                    </button>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusPill(
                                            u.status,
                                        )}`}
                                    >
                                        {u.status}
                                    </span>

                                    {u.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => approve(u.id)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-sm font-bold text-[#12150d] transition hover:brightness-95"
                                            >
                                                <Check size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => setDenyTarget(u)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                            >
                                                <X size={16} />
                                                Deny
                                            </button>
                                        </div>
                                    )}

                                    {u.status === 'suspended' && (
                                        <button
                                            onClick={() => approve(u.id)}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-ink transition hover:border-lime"
                                        >
                                            <Check size={16} />
                                            Reinstate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination paginator={users} />
            </div>

            <ConfirmDialog
                open={!!denyTarget}
                onOpenChange={(o) => !o && setDenyTarget(null)}
                destructive
                title="Deny this account?"
                description={
                    denyTarget
                        ? `${denyTarget.first_name} ${denyTarget.last_name} will be suspended and unable to sign in.`
                        : ''
                }
                confirmLabel="Suspend"
                onConfirm={deny}
            />

            {/* FULL DETAILS MODAL */}
            <Dialog
                open={!!detail}
                onOpenChange={(o) => !o && setDetail(null)}
            >
                <DialogContent className="border-line bg-card sm:max-w-lg">
                    {detail && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="sr-only">
                                    Runner details
                                </DialogTitle>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-lime bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-xl font-bold text-white">
                                        {detail.profile_photo ? (
                                            <img
                                                src={`/storage/${detail.profile_photo}`}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            avatarOf(detail)
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-2xl font-black italic text-ink">
                                                {detail.first_name}{' '}
                                                {detail.last_name}
                                            </span>
                                            {detail.verified && (
                                                <BadgeCheck
                                                    size={18}
                                                    className="text-lime-deep"
                                                />
                                            )}
                                        </div>
                                        <div className="text-sm text-muted">
                                            {detail.runner_code ?? 'No runner code'}
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                                <Detail label="Email" value={detail.email} wide />
                                <Detail
                                    label="Status"
                                    value={detail.status}
                                    cap
                                />
                                <Detail label="Role" value={detail.role} cap />
                                <Detail
                                    label="Gender"
                                    value={detail.gender ?? '—'}
                                />
                                <Detail
                                    label="Age"
                                    value={
                                        ageFrom(detail.birthday)?.toString() ??
                                        '—'
                                    }
                                />
                                <Detail
                                    label="Birthday"
                                    value={
                                        detail.birthday
                                            ? new Date(
                                                  detail.birthday,
                                              ).toLocaleDateString()
                                            : '—'
                                    }
                                />
                                <Detail
                                    label="Province"
                                    value={detail.province ?? '—'}
                                />
                                <Detail
                                    label="City"
                                    value={detail.city ?? '—'}
                                />
                                <Detail
                                    label="Island"
                                    value={detail.island ?? '—'}
                                />
                                <Detail
                                    label="Address"
                                    value={detail.address ?? '—'}
                                    wide
                                />
                                <Detail
                                    label="Verified"
                                    value={detail.verified ? 'Yes' : 'No'}
                                />
                                <Detail
                                    label="Joined"
                                    value={new Date(
                                        detail.created_at,
                                    ).toLocaleDateString()}
                                    wide
                                />
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function Detail({
    label,
    value,
    wide = false,
    cap = false,
}: {
    label: string;
    value: string;
    wide?: boolean;
    cap?: boolean;
}) {
    return (
        <div className={wide ? 'col-span-2' : ''}>
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#92A084]">
                {label}
            </div>
            <div
                className={`mt-0.5 text-sm font-semibold text-ink ${
                    cap ? 'capitalize' : ''
                }`}
            >
                {value}
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout active="users">{page}</AppLayout>
);
