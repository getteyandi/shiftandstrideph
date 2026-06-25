import { type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { NAV_ITEMS } from '@/lib/nav';
import { Bell } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
    children: ReactNode;
    /** Active nav id, e.g. "dashboard". */
    active?: string;
    /** Signed-in runner's initials for the avatar chip. */
    initials?: string;
    /** Shows the lime dot on the bell. */
    hasNotifications?: boolean;
}

/**
 * Light app shell (HANDOFF.md §2: "Light app, dark Hall of Fame"). Sticky,
 * blurred top bar with logo lockup, inline nav that wraps on narrow widths,
 * a notifications bell, and the runner avatar.
 */
export default function AppLayout({
    children,
    active,
    initials = 'MS',
    hasNotifications = true,
}: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-surface text-ink">
            <header className="sticky top-0 z-40 border-b border-line-2 bg-surface/85 backdrop-blur-[12px]">
                <div className="mx-auto flex max-w-[1320px] items-center gap-[clamp(12px,3vw,32px)] px-[clamp(16px,4vw,40px)] py-3">
                    {/* logo lockup */}
                    <Link
                        href="/dashboard"
                        className="flex shrink-0 items-center gap-[11px]"
                    >
                        <img
                            src="/assets/logo.png"
                            alt="Shift & Stride PH"
                            className="h-[42px] w-[42px] rounded-xl object-cover shadow-[0_2px_10px_rgba(12,15,11,.25)]"
                        />
                        <div className="leading-[.92]">
                            <div className="font-display text-[19px] font-extrabold tracking-[.01em] uppercase italic">
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
                        {NAV_ITEMS.map((n) => {
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
                            aria-label="Notifications"
                            className="relative flex h-10 w-10 items-center justify-center rounded-[11px] border border-line-2 bg-card text-[#3A4034] transition-colors hover:border-lime"
                        >
                            <Bell size={18} strokeWidth={2} />
                            {hasNotifications ? (
                                <span className="absolute top-1.5 right-[7px] h-2 w-2 animate-[pulse2_2s_infinite] rounded-full bg-lime shadow-[0_0_0_2px_#fff]" />
                            ) : null}
                        </button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-[11px] border-[1.5px] border-lime bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-base font-bold text-white">
                            {initials}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] pt-[clamp(20px,3.5vw,36px)] pb-[60px]">
                {children}
            </main>
        </div>
    );
}
