import { type ReactNode } from 'react';
import AppHeader from '@/components/AppHeader';

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
 * blurred top bar with logo lockup, inline nav, notifications bell, and the
 * runner avatar — all provided by the shared AppHeader.
 */
export default function AppLayout({
    children,
    active,
    initials = 'MS',
    hasNotifications = true,
}: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-surface text-ink">
            <AppHeader
                active={active}
                initials={initials}
                hasNotifications={hasNotifications}
            />

            <main className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] pt-[clamp(20px,3.5vw,36px)] pb-[60px]">
                {children}
            </main>
        </div>
    );
}
