import { Link } from '@inertiajs/react';
import { Trophy, Activity, MapPin } from 'lucide-react';

/**
 * Branded split auth shell for Shift & Stride PH: a dark, lime-accented brand
 * panel alongside the form. Title/description come from each page's
 * `Page.layout = { title, description }` static.
 */
export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* BRAND PANEL */}
            <div className="relative hidden overflow-hidden bg-[linear-gradient(155deg,#12150d,#090b08)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                {/* glow + track motif */}
                <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-lime/10 blur-3xl" />
                <svg
                    className="absolute inset-x-0 bottom-0 h-64 w-full opacity-50"
                    viewBox="0 0 600 240"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,200 C160,90 360,70 600,150"
                        stroke="#A6E212"
                        strokeWidth="2"
                        strokeDasharray="4 12"
                        fill="none"
                        opacity=".55"
                    />
                </svg>

                <Link
                    href="/"
                    className="relative flex items-center gap-3"
                >
                    <img
                        src="/assets/logo.png"
                        alt="Shift & Stride PH"
                        className="h-12 w-12 rounded-xl object-cover shadow-[0_2px_10px_rgba(12,15,11,.25)]"
                    />
                    <div className="leading-[.95]">
                        <div className="font-display text-xl font-extrabold uppercase italic">
                            Shift
                            <span className="text-lime"> &amp; </span>
                            Stride
                            <span className="ml-px align-super text-xs text-lime">
                                PH
                            </span>
                        </div>
                        <div className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[.32em] text-[#98A08E]">
                            Virtual Running League
                        </div>
                    </div>
                </Link>

                <div className="relative">
                    <h2 className="max-w-md font-display text-5xl font-black italic leading-[1.05]">
                        EVERY KILOMETER
                        <span className="text-lime"> COUNTS.</span>
                    </h2>
                    <p className="mt-4 max-w-sm text-[#98A08E]">
                        Join virtual races across the Philippines, log your runs,
                        and climb the leaderboard.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-6 text-sm">
                        <Feature icon={Activity} label="Track every run" />
                        <Feature icon={Trophy} label="Earn your rank" />
                        <Feature icon={MapPin} label="Race anywhere" />
                    </div>
                </div>

                <p className="relative text-xs text-[#6f7665]">
                    © {new Date().getFullYear()} Shift &amp; Stride PH
                </p>
            </div>

            {/* FORM SIDE */}
            <div className="flex flex-col items-center justify-center bg-surface p-6 md:p-10">
                <div className="w-full max-w-sm">
                    {/* mobile logo */}
                    <Link
                        href="/"
                        className="mb-8 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <img
                            src="/assets/logo.png"
                            alt="Shift & Stride PH"
                            className="h-10 w-10 rounded-xl object-cover"
                        />
                        <span className="font-display text-lg font-extrabold uppercase italic text-ink">
                            Shift <span className="text-lime-deep">&amp;</span>{' '}
                            Stride PH
                        </span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="font-display text-4xl font-black italic text-ink">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm text-muted">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}

function Feature({
    icon: Icon,
    label,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2 text-[#cdd3c3]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lime">
                <Icon size={17} />
            </span>
            {label}
        </div>
    );
}
