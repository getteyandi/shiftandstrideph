import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Award,
    BarChart3,
    CalendarCheck,
    Facebook,
    MapPin,
    Medal,
    ShieldCheck,
    Upload,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import EventCarousel from '@/components/EventCarousel';
import type { CarouselEvent } from '@/components/EventCarousel';
import Preloader from '@/components/Preloader';
import Reveal from '@/components/Reveal';
import { dashboard, login, register } from '@/routes';

interface WelcomeProps {
    events: CarouselEvent[];
    [key: string]: unknown;
}

/* ------------------------------------------------------------------ */

function PublicNav({ booted }: { booted: boolean }) {
    const { auth } = usePage().props as { auth: { user: unknown } };

    return (
        <header className="sticky top-0 z-40 border-b border-border-dark/80 bg-[#0A0C08]/85 backdrop-blur-[12px]">
            <div
                className="mx-auto flex max-w-[1320px] items-center gap-4 px-[clamp(16px,4vw,40px)] py-3"
                style={{
                    transition:
                        'opacity .6s ease, transform .6s cubic-bezier(.22,.61,.36,1)',
                    opacity: booted ? 1 : 0,
                    transform: booted ? 'none' : 'translateY(-14px)',
                }}
            >
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-[11px]"
                >
                    <img
                        src="/assets/logo.png"
                        alt="Shift & Stride PH"
                        className="h-[42px] w-[42px] rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,.4)]"
                    />
                    <div className="leading-[.92]">
                        <div className="font-display text-[19px] font-extrabold uppercase italic tracking-[.01em] text-white">
                            Shift
                            <span className="text-lime"> &amp; </span>
                            Stride
                            <span className="ml-px align-super text-[12px] text-lime">
                                PH
                            </span>
                        </div>
                        <div className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[.32em] text-[#8a9080]">
                            Virtual Running League
                        </div>
                    </div>
                </Link>

                <nav className="ml-auto flex items-center gap-2 sm:gap-3">
                    {auth?.user ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-lime-bright"
                        >
                            Go to Dashboard
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="hidden rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-lime hover:text-lime sm:inline-flex"
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-lime-bright"
                            >
                                Get started
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

/* ------------------------------------------------------------------ */

const STEPS = [
    {
        icon: CalendarCheck,
        title: 'Register & pick a race',
        body: 'Create your runner profile, browse open events, and join the distance category that matches your goal.',
    },
    {
        icon: Upload,
        title: 'Run anywhere, submit',
        body: 'Log your kilometres from any road, treadmill, or trail and upload your activity proof for approval.',
    },
    {
        icon: BarChart3,
        title: 'Climb the live board',
        body: 'Watch your progress meter fill up and your name rise on real-time leaderboards as the league unfolds.',
    },
    {
        icon: Award,
        title: 'Earn your finish',
        body: 'Hit your target to unlock a verifiable digital certificate and have your race kit shipped to your door.',
    },
];

const FEATURES = [
    {
        icon: Activity,
        title: 'Verified progress',
        body: 'Every submission is reviewed, so leaderboards and finishes reflect real, honest kilometres.',
    },
    {
        icon: Users,
        title: 'Solo, community & group',
        body: 'Run on your own, rally the whole community, or team up — every event format lives in one league.',
    },
    {
        icon: Medal,
        title: 'Live leaderboards',
        body: 'Rankings update as runs come in, turning a solo jog into a nationwide race you can feel.',
    },
    {
        icon: ShieldCheck,
        title: 'Authentic certificates',
        body: 'Finishers receive digital certificates with a public serial anyone can verify — no fakes.',
    },
];

/* ------------------------------------------------------------------ */

export default function Welcome({ events }: WelcomeProps) {
    const { auth } = usePage().props as { auth: { user: unknown } };
    const startHref = auth?.user ? dashboard() : register();

    // Flipped to true the instant the preloader begins its exit, releasing the
    // hero's staggered entrance for a seamless hand-off.
    const [booted, setBooted] = useState(false);

    return (
        <>
            <Head title="Shift & Stride PH — Virtual Running League">
                <meta
                    name="description"
                    content="Join Shift & Stride PH, the virtual running league. Register for events, log your kilometres, climb live leaderboards, and earn verified finisher certificates."
                />
            </Head>

            <Preloader onReveal={() => setBooted(true)} />

            <div className="min-h-screen bg-[#0A0C08] font-sans text-white">
                <PublicNav booted={booted} />

                {/* ============================ HERO ============================ */}
                <section className="relative overflow-hidden">
                    {/* ambient glows */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-40 left-1/2 h-[620px] w-[1100px] -translate-x-1/2"
                        style={{
                            background:
                                'radial-gradient(ellipse,rgba(166,226,18,.18),transparent 62%)',
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[.35]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(166,226,18,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(166,226,18,.06) 1px,transparent 1px)',
                            backgroundSize: '54px 54px',
                            maskImage:
                                'radial-gradient(ellipse at 50% 0%,black,transparent 70%)',
                        }}
                    />

                    <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] pt-[clamp(48px,7vw,96px)] pb-[clamp(32px,5vw,64px)] text-center">
                        <Reveal
                            as="span"
                            active={booted}
                            delay={60}
                            y={16}
                            className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-lime-bright"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                            </span>
                            The Philippines' virtual running league
                        </Reveal>

                        <Reveal
                            as="h1"
                            active={booted}
                            delay={160}
                            className="mx-auto mt-6 max-w-4xl font-display text-[clamp(44px,9vw,104px)] font-black uppercase italic leading-[.85] text-white"
                        >
                            Every kilometre
                            <br />
                            <span className="text-lime">counts.</span>
                        </Reveal>

                        <Reveal
                            as="p"
                            active={booted}
                            delay={280}
                            className="mx-auto mt-6 max-w-2xl text-[clamp(15px,2.2vw,19px)] leading-relaxed text-[#c1c9b4]"
                        >
                            Register for virtual races, log your runs from
                            anywhere, and race the whole country on live
                            leaderboards. Finish strong and earn a verified
                            certificate that's truly yours.
                        </Reveal>

                        <Reveal
                            active={booted}
                            delay={400}
                            className="mt-9 flex flex-wrap items-center justify-center gap-3"
                        >
                            <Link
                                href={startHref}
                                className="inline-flex items-center gap-2 rounded-2xl bg-lime px-8 py-4 text-base font-bold text-ink-900 shadow-[0_10px_40px_-10px_rgba(166,226,18,.6)] transition hover:-translate-y-0.5 hover:bg-lime-bright"
                            >
                                {auth?.user
                                    ? 'Go to your dashboard'
                                    : 'Start your first race'}
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </Link>
                            <a
                                href="#events"
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-lime hover:text-lime"
                            >
                                Browse active events
                            </a>
                        </Reveal>
                    </div>
                </section>

                {/* ========================= EVENTS CAROUSEL ==================== */}
                <section
                    id="events"
                    className="relative mx-auto max-w-[1320px] scroll-mt-24 px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,80px)]"
                >
                    <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <span className="font-display text-sm font-bold uppercase italic tracking-[.16em] text-lime">
                                Now on the start line
                            </span>
                            <h2 className="mt-1 font-display text-[clamp(30px,5vw,52px)] font-black uppercase italic leading-none text-white">
                                Active Events
                            </h2>
                        </div>
                        <p className="max-w-sm text-sm leading-relaxed text-[#9aa48c]">
                            Open and upcoming races you can join right now.
                            Featured events lead the pack — tap through to find
                            your distance.
                        </p>
                    </Reveal>

                    <Reveal delay={120} y={32}>
                        <EventCarousel events={events} />
                    </Reveal>
                </section>

                {/* ========================= HOW IT WORKS ====================== */}
                <section className="relative border-y border-border-dark bg-panel/40">
                    <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)]">
                        <Reveal className="mb-12 text-center">
                            <span className="font-display text-sm font-bold uppercase italic tracking-[.16em] text-lime">
                                How it works
                            </span>
                            <h2 className="mt-1 font-display text-[clamp(30px,5vw,52px)] font-black uppercase italic leading-none text-white">
                                From sign-up to finish line
                            </h2>
                        </Reveal>

                        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {STEPS.map((step, i) => {
                                const Icon = step.icon;

                                return (
                                    <Reveal
                                        as="li"
                                        key={step.title}
                                        delay={i * 100}
                                        className="group relative rounded-[20px] border border-border-dark bg-[#0d1109] p-6 transition duration-300 hover:-translate-y-1 hover:border-lime/60"
                                    >
                                        <span className="absolute right-5 top-4 font-display text-5xl font-black italic text-white/5 transition group-hover:text-lime/15">
                                            {i + 1}
                                        </span>
                                        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lime/12 text-lime ring-1 ring-lime/25 transition group-hover:scale-110">
                                            <Icon size={22} strokeWidth={2} />
                                        </span>
                                        <h3 className="font-display text-xl font-bold italic text-white">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-[#9aa48c]">
                                            {step.body}
                                        </p>
                                    </Reveal>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* ========================= WHY JOIN ========================== */}
                <section className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)]">
                    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
                        <Reveal x={-24} y={0}>
                            <span className="font-display text-sm font-bold uppercase italic tracking-[.16em] text-lime">
                                Why runners stay
                            </span>
                            <h2 className="mt-1 font-display text-[clamp(30px,5vw,52px)] font-black uppercase italic leading-[.95] text-white">
                                A league built to keep you moving
                            </h2>
                            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#a9b19a]">
                                Shift &amp; Stride PH turns solo training into a
                                shared, competitive season. Real verification,
                                real rankings, and rewards worth chasing — all in
                                one place.
                            </p>
                            <Link
                                href={startHref}
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-lime px-6 py-3 text-sm font-bold text-ink-900 transition hover:-translate-y-0.5 hover:bg-lime-bright"
                            >
                                {auth?.user
                                    ? 'Open dashboard'
                                    : 'Create your account'}
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </Link>
                        </Reveal>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {FEATURES.map((f, i) => {
                                const Icon = f.icon;

                                return (
                                    <Reveal
                                        key={f.title}
                                        delay={i * 100}
                                        className="group rounded-[20px] border border-border-dark bg-[#0d1109] p-6 transition duration-300 hover:-translate-y-1 hover:border-lime/60"
                                    >
                                        <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-lime/12 text-lime ring-1 ring-lime/25 transition group-hover:scale-110">
                                            <Icon size={20} strokeWidth={2} />
                                        </span>
                                        <h3 className="font-display text-lg font-bold italic text-white">
                                            {f.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-[#9aa48c]">
                                            {f.body}
                                        </p>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ========================= FINAL CTA ========================= */}
                <section className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] pb-[clamp(48px,7vw,88px)]">
                    <Reveal
                        y={36}
                        className="relative overflow-hidden rounded-[28px] border border-lime/40 bg-[linear-gradient(145deg,#141a0c,#090b07)] px-6 py-14 text-center sm:px-12"
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-1/2 left-1/2 h-[140%] w-[70%] -translate-x-1/2 [animation:pulse2_3s_ease-in-out_infinite]"
                            style={{
                                background:
                                    'radial-gradient(closest-side,rgba(166,226,18,.22),transparent 70%)',
                            }}
                        />
                        <div className="relative">
                            <h2 className="mx-auto max-w-2xl font-display text-[clamp(30px,6vw,60px)] font-black uppercase italic leading-[.9] text-white">
                                Your next start line
                                <span className="text-lime"> is waiting</span>
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#bcc4ad]">
                                Join the league today. Pick a race, lace up, and
                                let every kilometre count toward something.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    href={startHref}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-lime px-8 py-4 text-base font-bold text-ink-900 shadow-[0_10px_40px_-10px_rgba(166,226,18,.6)] transition hover:-translate-y-0.5 hover:bg-lime-bright"
                                >
                                    {auth?.user
                                        ? 'Go to dashboard'
                                        : 'Get started free'}
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </Link>
                                {!auth?.user && (
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-lime hover:text-lime"
                                    >
                                        I already have an account
                                    </Link>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ========================= FOOTER ============================ */}
                <footer className="border-t border-border-dark">
                    <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-[clamp(16px,4vw,40px)] py-8 text-center sm:flex-row sm:text-left">
                        <div className="flex items-center gap-3">
                            <img
                                src="/assets/logo.png"
                                alt="Shift & Stride PH"
                                className="h-9 w-9 rounded-lg object-cover"
                            />
                            <div className="leading-tight">
                                <div className="font-display text-sm font-extrabold uppercase italic text-white">
                                    Shift &amp; Stride PH
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.2em] text-[#8a9080]">
                                    <MapPin size={11} className="text-lime" />
                                    Virtual Running League
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                            <a
                                href="https://www.facebook.com/shiftandstrideph"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-[#c1c9b4] transition hover:-translate-y-0.5 hover:border-lime hover:text-lime"
                            >
                                <Facebook size={15} />
                                Follow us on Facebook
                            </a>
                            <p className="text-xs text-[#8a9080]">
                                © {new Date().getFullYear()} Shift &amp; Stride
                                PH. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
