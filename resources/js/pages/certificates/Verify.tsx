import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, ShieldX } from 'lucide-react';

interface Props {
    serial: string;
    certificate: {
        serial_no: string;
        runner_name: string | null;
        event_name: string | null;
        issued_at: string | null;
    } | null;
}

export default function Verify({ serial, certificate }: Props) {
    const valid = !!certificate;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#0b0e08,#12150d)] px-5 py-12">
            <Head title={`Verify ${serial}`} />

            <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-[#2a3120] bg-[#12150d] text-center">
                <div
                    className="px-8 pt-9 pb-6"
                    style={{
                        background:
                            'radial-gradient(420px 200px at 50% -40%, rgba(166,226,18,.18), transparent 70%)',
                    }}
                >
                    <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                            valid
                                ? 'bg-lime/15 text-lime'
                                : 'bg-red-500/15 text-red-400'
                        }`}
                    >
                        {valid ? (
                            <BadgeCheck size={34} />
                        ) : (
                            <ShieldX size={34} />
                        )}
                    </div>
                    <div className="mt-4 text-[11px] font-bold uppercase tracking-[.28em] text-lime">
                        Shift &amp; Stride PH
                    </div>
                    <h1 className="mt-1 font-display text-3xl font-black italic uppercase text-white">
                        {valid ? 'Verified Certificate' : 'Not Found'}
                    </h1>
                </div>

                <div className="px-8 pb-9">
                    {valid ? (
                        <div className="space-y-3 text-left">
                            <Row label="Runner" value={certificate!.runner_name} />
                            <Row label="Event" value={certificate!.event_name} />
                            <Row
                                label="Issued"
                                value={certificate!.issued_at}
                            />
                            <Row
                                label="Serial"
                                value={certificate!.serial_no}
                                mono
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-[#9aa48c]">
                            No certificate matches serial{' '}
                            <span className="font-mono text-[#c9d1be]">
                                {serial}
                            </span>
                            . Check the code and try again.
                        </p>
                    )}

                    <Link
                        href="/"
                        className="mt-7 inline-flex rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-[#12150d] transition hover:brightness-95"
                    >
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Row({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string | null;
    mono?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[#242a1b] pb-2.5 last:border-b-0">
            <span className="text-xs font-bold uppercase tracking-wide text-[#717c63]">
                {label}
            </span>
            <span
                className={`text-right text-sm font-semibold text-[#e7ece0] ${
                    mono ? 'font-mono' : ''
                }`}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}
