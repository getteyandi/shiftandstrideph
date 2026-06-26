import { Link, router, usePage } from '@inertiajs/react';
import { ADMIN_NAV_ITEMS, NAV_ITEMS } from '@/lib/nav';
import { Bell } from '@/lib/icons';
import { LogOut, Settings, Sun, Moon } from 'lucide-react';
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

interface AppHeaderProps {
    /** Active nav id, e.g. "dashboard". */
    active?: string;
    initials?: string;
    hasNotifications?: boolean;
}

/**
 * The single, shared top bar used across every authenticated view (light app
 * shell and the dark Hall of Fame) so the navbar stays consistent everywhere:
 * logo lockup, role-aware nav, notifications bell, and the avatar/logout menu.
 */
export default function AppHeader({
    active,
    initials = 'MS',
    hasNotifications = true,
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

                {/* primary nav */}
                <nav className="ml-auto flex flex-wrap items-center justify-end gap-1">
                    {navItems.map((n) => {
                        const Icon = n.icon;
                        const on = active === n.id;
                        return (
                            <Link
                                key={n.id}
                                href={n.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-[11px] px-3.5 py-[9px] text-sm font-semibold transition-colors',
                                    on
                                        ? 'bg-lime text-ink-900'
                                        : 'bg-transparent text-[#5A6152] hover:bg-[#E4E8DD]',
                                )}
                            >
                                <Icon size={17} strokeWidth={2} />
                                <span>{n.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* utilities */}
                <div className="ml-1.5 flex shrink-0 items-center gap-3">
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
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="relative flex h-10 w-10 items-center justify-center rounded-[11px] border border-line-2 bg-card text-ink transition-colors hover:border-lime"
                    >
                        <Bell size={18} strokeWidth={2} />
                        {hasNotifications ? (
                            <span className="absolute top-1.5 right-[7px] h-2 w-2 animate-[pulse2_2s_infinite] rounded-full bg-lime shadow-[0_0_0_2px_#fff]" />
                        ) : null}
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Account menu"
                                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[11px] border-[1.5px] border-lime bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-base font-bold text-white transition hover:brightness-110 focus:outline-none"
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
