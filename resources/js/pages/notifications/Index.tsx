import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    UserPlus,
    CheckCircle2,
    XCircle,
    ClipboardList,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/SectionHeader';
import Pagination, { type PaginationLink } from '@/components/Pagination';
import { cn } from '@/lib/utils';

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    url: string | null;
    category: string;
    read: boolean;
    time: string;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}

interface Props {
    notifications: Paginated<NotificationItem>;
}

const CATEGORY_ICON: Record<
    string,
    { Icon: typeof UserPlus; color: string }
> = {
    invite: { Icon: UserPlus, color: '#7c5cff' },
    approval: { Icon: CheckCircle2, color: '#5f8c00' },
    rejection: { Icon: XCircle, color: '#c0392b' },
    registration: { Icon: ClipboardList, color: '#b07d00' },
    info: { Icon: Bell, color: '#5A6152' },
};

export default function Index({ notifications }: Props) {
    const open = (n: NotificationItem) =>
        router.post(
            `/notifications/${n.id}/read`,
            { redirect: !!n.url },
            { preserveScroll: !n.url },
        );

    const markAll = () =>
        router.post('/notifications/read-all', {}, { preserveScroll: true });

    const hasUnread = notifications.data.some((n) => !n.read);

    return (
        <div>
            <Head title="Notifications" />

            <div className="animate-[floatup_.4s_ease_both] space-y-6">
                <SectionHeader
                    title="Notifications"
                    aside={
                        hasUnread ? (
                            <button
                                type="button"
                                onClick={markAll}
                                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2 text-[13px] font-semibold text-lime-deep transition hover:border-lime"
                            >
                                <CheckCheck size={15} />
                                Mark all read
                            </button>
                        ) : undefined
                    }
                />

                {notifications.data.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-line bg-card py-20 text-center">
                        <Bell className="mx-auto mb-3 text-lime" size={36} />
                        <p className="font-semibold text-ink">
                            No notifications yet
                        </p>
                        <p className="mt-1 text-sm text-muted">
                            Invitations, approvals, and updates will show up here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                        {notifications.data.map((n) => {
                            const meta =
                                CATEGORY_ICON[n.category] ?? CATEGORY_ICON.info;
                            const Icon = meta.Icon;
                            return (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => open(n)}
                                    className={cn(
                                        'flex w-full items-start gap-4 border-b border-line px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-line/40',
                                        !n.read && 'bg-[#f7fceb]',
                                    )}
                                >
                                    <span
                                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                        style={{
                                            background: `${meta.color}1a`,
                                            color: meta.color,
                                        }}
                                    >
                                        <Icon size={18} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[15px] font-bold text-ink">
                                                {n.title}
                                            </span>
                                            {!n.read && (
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-lime" />
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-sm text-muted-2">
                                            {n.body}
                                        </p>
                                        <p className="mt-1 text-xs font-semibold text-muted">
                                            {n.time}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                <Pagination paginator={notifications} />
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
