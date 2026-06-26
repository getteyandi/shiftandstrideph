import { type ReactNode } from 'react';
import AppHeader from '@/components/AppHeader';

interface PublicLayoutProps {
    children: ReactNode;
    active?: string;
}

/**
 * Dark Hall of Fame shell. Uses the same shared AppHeader as the rest of the
 * app (consistent navbar) on top of a full-bleed dark, lime-glow body.
 */
export default function PublicLayout({
    children,
    active = 'halloffame',
}: PublicLayoutProps) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0A0C08] text-white">
            <AppHeader active={active} />

            {/* ambient glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute top-[60px] left-1/2 h-[500px] w-[900px] -translate-x-1/2"
                style={{
                    background:
                        'radial-gradient(ellipse,rgba(166,226,18,.16),transparent 65%)',
                }}
            />

            <main className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,4vw,48px)] pb-[70px]">
                {children}
            </main>
        </div>
    );
}
