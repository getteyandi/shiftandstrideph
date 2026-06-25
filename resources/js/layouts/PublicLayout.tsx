import { type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { NAV_ITEMS } from '@/lib/nav';
import { cn } from '@/lib/utils';

interface PublicLayoutProps {
    children: ReactNode;
    active?: string;
}

/**
 * Dark public shell for Hall of Fame (HANDOFF.md §2). The whole tree is wrapped
 * in `.dark` so it's the ONLY dark surface — the rest of the app stays light.
 * A radial lime glow sits behind the masthead.
 */
export default function PublicLayout({
    children,
    active = 'halloffame',
}: PublicLayoutProps) {
    return (
        <div className="dark relative min-h-screen overflow-hidden bg-[#0A0C08] text-white">
            {/* ambient glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-[120px] left-1/2 h-[500px] w-[900px] -translate-x-1/2"
                style={{
                    background:
                        'radial-gradient(ellipse,rgba(166,226,18,.16),transparent 65%)',
                }}
            />

            <header className="sticky top-0 z-40 border-b border-[#1c2114] bg-[#0A0C08]/80 backdrop-blur-[12px]">
                <div className="mx-auto flex max-w-[1320px] items-center gap-[clamp(12px,3vw,32px)] px-[clamp(16px,4vw,40px)] py-3">
                    <Link
                        href="/hall-of-fame"
                        className="flex shrink-0 items-center gap-[11px]"
                    >
                        <img
                            src="/assets/logo.png"
                            alt="Shift & Stride PH"
                            className="h-[42px] w-[42px] rounded-xl object-cover"
                        />
                        <div className="font-display text-[19px] font-extrabold text-white uppercase italic">
                            Shift<span className="text-lime"> &amp; </span>
                            Stride
                            <span className="align-super text-[12px] text-lime">
                                PH
                            </span>
                        </div>
                    </Link>

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
                                            : 'bg-transparent text-[#9aa68d] hover:bg-[#1c2114]',
                                    )}
                                >
                                    <Icon size={17} strokeWidth={2} />
                                    <span>{n.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,4vw,48px)] pb-[70px]">
                {children}
            </main>
        </div>
    );
}
