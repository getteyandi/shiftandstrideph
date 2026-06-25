import StatTile from './StatTile';

function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
}

// runner: { name, runner_code, total_distance, events_completed, verified, details: [{label, value}] }
export default function RunnerHero({ runner }) {
    const {
        name = '',
        runner_code = '',
        total_distance = 0,
        events_completed = 0,
        verified = false,
        details = [],
    } = runner ?? {};

    return (
        <section className="relative mb-[26px] overflow-hidden rounded-[22px] border border-[#2a3120] bg-[linear-gradient(120deg,#10130c_0%,#171c11_55%,#0c0f0b_100%)] p-[clamp(22px,3vw,34px)]">
            {/* ambient glow + speed streak */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_320px_at_88%_-10%,rgba(166,226,18,.22),transparent_60%)] opacity-55" />
            <div className="absolute -top-[30px] right-[18%] h-2 w-40 -skew-x-[20deg] bg-[linear-gradient(90deg,transparent,#A6E212)] opacity-60 blur-[3px]" />

            <div className="relative flex flex-wrap items-center gap-[clamp(20px,3vw,40px)]">
                <div className="flex min-w-[240px] items-center gap-5">
                    <div className="relative">
                        <div className="flex h-[92px] w-[92px] items-center justify-center rounded-[24px] border-2 border-lime bg-[linear-gradient(145deg,#2a3320,#0c0f0b)] font-display text-[38px] font-extrabold text-white shadow-[0_8px_24px_rgba(0,0,0,.4)]">
                            {initials(name)}
                        </div>
                        {verified && (
                            <span className="absolute -right-1.5 -bottom-1.5 rounded-full border-2 border-ink-900 bg-lime px-2 py-[3px] text-[10px] font-extrabold tracking-[.04em] text-ink-900">
                                VERIFIED
                            </span>
                        )}
                    </div>

                    <div>
                        <div className="mb-1 text-[11px] font-bold tracking-[.28em] text-lime uppercase">
                            Runner Profile
                        </div>
                        <h1 className="m-0 font-display text-[clamp(30px,4.4vw,46px)] leading-[.92] font-extrabold text-white uppercase italic">
                            {name}
                        </h1>
                        <div className="mt-2.5 inline-flex items-center gap-[7px] rounded-full border border-[#333c26] bg-white/[.06] px-3 py-[5px]">
                            <span className="text-[11px] tracking-[.1em] text-[#8c9882]">
                                RUNNER CODE
                            </span>
                            <span className="font-stat font-bold tracking-[.06em] text-white">
                                {runner_code}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="ml-auto flex flex-wrap gap-3.5">
                    <StatTile
                        tone="dark"
                        accent
                        label="Total Distance"
                        value={total_distance}
                        unit="KM"
                    />
                    <StatTile
                        tone="dark"
                        label="Events Completed"
                        value={events_completed}
                    />
                </div>
            </div>

            {/* personal details strip */}
            {details.length > 0 && (
                <div className="relative mt-6 flex flex-wrap gap-[clamp(18px,4vw,48px)] border-t border-[#28311c] pt-5">
                    {details.map((d) => (
                        <div key={d.label}>
                            <div className="mb-[3px] text-[10px] font-bold tracking-[.18em] text-[#717c63] uppercase">
                                {d.label}
                            </div>
                            <div className="text-[15px] font-semibold text-[#e7ece0]">
                                {d.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
