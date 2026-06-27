import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ADMIN_NAV_ITEMS, NAV_ITEMS, type NavItem } from '@/lib/nav';
import { Bell } from '@/lib/icons';
import {
    LogOut,
    Settings,
    Sun,
    Moon,
    ChevronDown,
    CheckCheck,
    UserPlus,
    CheckCircle2,
    XCircle,
    ClipboardList,
    Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/hooks/use-appearance';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';

interface AppHeaderProps {
    /** Active nav id, e.g. "dashboard". */
    active?: string;
    initials?: string;
}

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    url: string | null;
    category: string;
    read: boolean;
    time: string;
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

/** Bell with unread badge + dropdown of the latest notifications. */
function NotificationsBell() {
    const { notifications } = usePage().props as any;
    const items: NotificationItem[] = notifications?.items ?? [];
    const unread: number = notifications?.unread ?? 0;

    const open = (n: NotificationItem) => {
        router.post(
            `/notifications/${n.id}/read`,
            { redirect: !!n.url },
            { preserveScroll: !n.url },
        );
    };

    const markAll = () =>
        router.post('/notifications/read-all', {}, { preserveScroll: true });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-[11px] border border-line-2 bg-card text-ink transition-colors hover:border-lime focus:outline-none"
                >
                    <Bell size={18} strokeWidth={2} />
                    {unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-[#12150d] shadow-[0_0_0_2px_var(--surface,#fff)]">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[min(340px,calc(100vw-1.5rem))] border-line bg-card p-0 shadow-lg"
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-display text-base font-black italic text-ink">
                        Notifications
                    </span>
                    {unread > 0 && (
                        <button
                            type="button"
                            onClick={markAll}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-lime-deep hover:underline"
                        >
                            <CheckCheck size={13} />
                            Mark all read
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />

                {items.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-muted">
                        <Bell
                            size={26}
                            className="mx-auto mb-2 text-muted-2 opacity-60"
                        />
                        You're all caught up.
                    </div>
                ) : (
                    <div className="max-h-[380px] overflow-y-auto">
                        {items.map((n) => {
                            const meta =
                                CATEGORY_ICON[n.category] ?? CATEGORY_ICON.info;
                            const Icon = meta.Icon;
                            return (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => open(n)}
                                    className={cn(
                                        'flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-line/40',
                                        !n.read && 'bg-[#f7fceb]',
                                    )}
                                >
                                    <span
                                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            background: `${meta.color}1a`,
                                            color: meta.color,
                                        }}
                                    >
                                        <Icon size={16} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-2">
                                            <span className="truncate text-sm font-bold text-ink">
                                                {n.title}
                                            </span>
                                            {!n.read && (
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                                            )}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-muted-2">
                                            {n.body}
                                        </span>
                                        <span className="mt-1 block text-[11px] font-semibold text-muted">
                                            {n.time}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                <DropdownMenuSeparator className="m-0" />
                <Link
                    href="/notifications"
                    className="block px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-lime-deep hover:bg-line/40"
                >
                    View all
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Slide-in drawer that replaces the inline nav below the `lg` breakpoint:
 * account header, role-aware links (groups flattened under a label), and
 * account actions. Each link closes the drawer on tap.
 */
function MobileNav({
    navItems,
    active,
    user,
    fullName,
    userInitials,
    photoUrl,
}: {
    navItems: NavItem[];
    active?: string;
    user: any;
    fullName: string;
    userInitials: string;
    photoUrl: string | null;
}) {
    const [open, setOpen] = useState(false);

    const linkClass = (on: boolean) =>
        cn(
            'flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-colors',
            on
                ? 'bg-lime text-ink-900'
                : 'text-muted-2 hover:bg-line hover:text-ink',
        );

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="Open menu"
                    className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-line-2 bg-card text-ink transition-colors hover:border-lime lg:hidden"
                >
                    <Menu size={19} strokeWidth={2} />
                </button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-[86%] max-w-xs gap-0 border-line bg-surface p-0 text-ink"
            >
                {/* account header */}
                <div className="flex items-center gap-3 border-b border-line px-5 pt-5 pb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-[1.5px] border-lime bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-lg font-bold text-white">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            userInitials
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-display text-lg font-black italic text-ink">
                            {fullName || 'Account'}
                        </div>
                        {user?.email && (
                            <div className="truncate text-xs text-muted">
                                {user.email}
                            </div>
                        )}
                    </div>
                </div>

                {/* nav links */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {navItems.map((n) => {
                        const Icon = n.icon;
                        if (n.children?.length) {
                            return (
                                <div key={n.id} className="pt-2">
                                    <div className="px-3.5 pb-1 text-[10px] font-bold uppercase tracking-[.18em] text-muted">
                                        {n.label}
                                    </div>
                                    {n.children.map((c) => {
                                        const CIcon = c.icon;
                                        return (
                                            <SheetClose asChild key={c.id}>
                                                <Link
                                                    href={c.href ?? '#'}
                                                    className={linkClass(
                                                        active === c.id,
                                                    )}
                                                >
                                                    <CIcon size={18} />
                                                    {c.label}
                                                </Link>
                                            </SheetClose>
                                        );
                                    })}
                                </div>
                            );
                        }
                        return (
                            <SheetClose asChild key={n.id}>
                                <Link
                                    href={n.href ?? '#'}
                                    className={linkClass(active === n.id)}
                                >
                                    <Icon size={18} />
                                    {n.label}
                                </Link>
                            </SheetClose>
                        );
                    })}
                </nav>

                {/* account actions */}
                <div className="space-y-1 border-t border-line px-3 py-4">
                    <SheetClose asChild>
                        <Link
                            href="/settings/profile"
                            className={linkClass(false)}
                        >
                            <Settings size={18} />
                            Settings
                        </Link>
                    </SheetClose>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        onClick={() => router.flushAll()}
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                    >
                        <LogOut size={18} />
                        Log out
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}

/**
 * The single, shared top bar used across every authenticated view (light app
 * shell and the dark Hall of Fame) so the navbar stays consistent everywhere:
 * logo lockup, role-aware nav, notifications bell, and the avatar/logout menu.
 */
export default function AppHeader({
    active,
    initials = 'MS',
}: AppHeaderProps) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    const fullName = user
        ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
        : '';

    const userInitials =
        user && (user.first_name || user.last_name)
            ? `${(user.first_name ?? ' ')[0]}${(user.last_name ?? ' ')[0]}`.toUpperCase()
            : initials;

    const photoUrl = user?.profile_photo
        ? `/storage/${user.profile_photo}`
        : null;

    const navItems = isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;

    return (
        <header className="sticky top-0 z-40 border-b border-line-2 bg-surface/85 backdrop-blur-[12px]">
            <div className="mx-auto flex max-w-[1320px] items-center gap-[clamp(12px,3vw,32px)] px-[clamp(16px,4vw,40px)] py-3">
                {/* logo lockup */}
                <Link
                    href={isAdmin ? '/admin/dashboard' : '/dashboard'}
                    className="flex shrink-0 items-center gap-[11px]"
                >
                    <img
                        src="/assets/logo.png"
                        alt="Shift & Stride PH"
                        className="h-[42px] w-[42px] rounded-xl object-cover shadow-[0_2px_10px_rgba(12,15,11,.25)]"
                    />
                    <div className="leading-[.92]">
                        <div className="font-display text-[19px] font-extrabold tracking-[.01em] uppercase italic text-ink">
                            Shift
                            <span className="text-lime-deep"> &amp; </span>
                            Stride
                            <span className="ml-px align-super text-[12px] text-lime-deep">
                                PH
                            </span>
                        </div>
                        <div className="mt-0.5 text-[9.5px] font-semibold tracking-[.32em] text-muted uppercase">
                            Virtual Running League
                        </div>
                    </div>
                </Link>

                {/* primary nav (desktop) */}
                <nav className="ml-auto hidden flex-wrap items-center justify-end gap-1 lg:flex">
                    {navItems.map((n) => {
                        const Icon = n.icon;

                        // Grouped item → dropdown.
                        if (n.children?.length) {
                            const groupActive = n.children.some(
                                (c) => c.id === active,
                            );
                            return (
                                <DropdownMenu key={n.id}>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                'flex items-center gap-2 rounded-[11px] px-3.5 py-[9px] text-sm font-semibold transition-colors focus:outline-none',
                                                groupActive
                                                    ? 'bg-lime text-ink-900'
                                                    : 'bg-transparent text-muted-2 hover:bg-line hover:text-ink',
                                            )}
                                        >
                                            <Icon size={17} strokeWidth={2} />
                                            <span>{n.label}</span>
                                            <ChevronDown size={14} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-52 border-line bg-card shadow-lg"
                                    >
                                        {n.children.map((c) => {
                                            const CIcon = c.icon;
                                            const con = active === c.id;
                                            return (
                                                <DropdownMenuItem
                                                    key={c.id}
                                                    asChild
                                                    className={
                                                        con
                                                            ? 'bg-[#eef7d8] text-ink focus:bg-[#eef7d8]'
                                                            : ''
                                                    }
                                                >
                                                    <Link
                                                        href={c.href ?? '#'}
                                                        className="cursor-pointer"
                                                    >
                                                        <CIcon
                                                            size={16}
                                                            strokeWidth={2}
                                                        />
                                                        {c.label}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }

                        const on = active === n.id;
                        return (
                            <Link
                                key={n.id}
                                href={n.href ?? '#'}
                                className={cn(
                                    'flex items-center gap-2 rounded-[11px] px-3.5 py-[9px] text-sm font-semibold transition-colors',
                                    on
                                        ? 'bg-lime text-ink-900'
                                        : 'bg-transparent text-muted-2 hover:bg-line hover:text-ink',
                                )}
                            >
                                <Icon size={17} strokeWidth={2} />
                                <span>{n.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* utilities */}
                <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-1.5">
                    <button
                        type="button"
                        aria-label="Toggle theme"
                        onClick={() =>
                            updateAppearance(isDark ? 'light' : 'dark')
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-line-2 bg-card text-ink transition-colors hover:border-lime"
                    >
                        {isDark ? (
                            <Sun size={18} strokeWidth={2} />
                        ) : (
                            <Moon size={18} strokeWidth={2} />
                        )}
                    </button>
                    <NotificationsBell />

                    {/* mobile menu trigger */}
                    <MobileNav
                        navItems={navItems}
                        active={active}
                        user={user}
                        fullName={fullName}
                        userInitials={userInitials}
                        photoUrl={photoUrl}
                    />

                    {/* account menu (desktop) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Account menu"
                                className="hidden h-10 w-10 items-center justify-center overflow-hidden rounded-[11px] border-[1.5px] border-lime bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-base font-bold text-white transition hover:brightness-110 focus:outline-none lg:flex"
                            >
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt={fullName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    userInitials
                                )}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-56 border-line bg-card shadow-lg"
                        >
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col gap-0.5">
                                    <span className="truncate text-sm font-semibold text-ink">
                                        {fullName || 'Account'}
                                    </span>
                                    {user?.email && (
                                        <span className="truncate text-xs text-muted">
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <Link
                                    href="/settings/profile"
                                    className="cursor-pointer"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                asChild
                                className="bg-red-50 focus:bg-red-100"
                            >
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => router.flushAll()}
                                    className="w-full cursor-pointer font-semibold text-red-600 focus:text-red-700"
                                    data-test="logout-button"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
