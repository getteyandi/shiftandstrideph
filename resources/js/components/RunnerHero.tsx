import StatTile from './StatTile';

interface PersonalDetail {
    label: string;
    value: string | number;
}

interface RunnerHeroProps {
    runner: {
        name: string;
        initials: string;
        runner_code: string;
        profile_photo?: string | null;
        verified?: boolean;
        rank?: number | null;
        best_km?: number | string;
        best_rank?: number | null;
        total_distance: number | string;
        events_completed: number | string;
    };
    /** Age / Birthday / Gender / Province / City — order preserved. */
    personal: PersonalDetail[];
}

/**
 * Runner Profile hero (HANDOFF.md §3). A dark card on the light Dashboard page:
 * gradient ink field, ambient lime glow, a skewed lime streak, the runner's
 * avatar + code, two stat tiles, and a personal-details strip below a hairline.
 */
export default function RunnerHero({ runner, personal }: RunnerHeroProps) {
    return (
        <section className="relative mb-[26px] overflow-hidden rounded-[22px] border border-[#2a3120] bg-[linear-gradient(120deg,#10130c_0%,#171c11_55%,#0c0f0b_100%)] p-[clamp(22px,3vw,34px)]">
            {/* ambient lime glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-55"
                style={{
                    background:
                        'radial-gradient(420px 320px at 88% -10%,rgba(166,226,18,.22),transparent 60%)',
                }}
            />
            {/* skewed lime streak */}
            <div
                aria-hidden
                className="absolute -top-[30px] right-[18%] h-2 w-40 -skew-x-[20deg] bg-[linear-gradient(90deg,transparent,#A6E212)] opacity-60 blur-[3px]"
            />

            <div className="relative flex flex-wrap items-center gap-[clamp(20px,3vw,40px)]">
                {/* identity */}
                <div className="flex min-w-[240px] items-center gap-5">
                    <div className="relative">
                        <div className="flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-[24px] border-2 border-lime bg-[linear-gradient(145deg,#2a3320,#0c0f0b)] font-display text-[38px] font-extrabold text-white shadow-[0_8px_24px_rgba(0,0,0,.4)]">
                            {runner.profile_photo ? (
                                <img
                                    src={`/storage/${runner.profile_photo}`}
                                    alt={runner.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                runner.initials
                            )}
                        </div>
                        {runner.verified ? (
                            <span className="absolute -right-1.5 -bottom-1.5 rounded-full border-2 border-ink-900 bg-lime px-2 py-[3px] text-[10px] font-extrabold tracking-[.04em] text-ink-900">
                                VERIFIED
                            </span>
                        ) : null}
                    </div>
                    <div>
                        <div className="mb-1 text-[11px] font-bold tracking-[.28em] text-lime uppercase">
                            Runner Profile
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="m-0 font-display text-[clamp(30px,4.4vw,46px)] leading-[.92] font-extrabold text-white uppercase italic">
                                {runner.name}
                            </h1>
                            {runner.rank != null && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 font-display text-lg font-extrabold italic text-lime">
                                    #{runner.rank}
                                    <span className="text-[10px] font-bold not-italic tracking-[.12em] text-[#8c9882] uppercase">
                                        Overall
                                    </span>
                                </span>
                            )}
                        </div>
                        <div className="mt-2.5 inline-flex items-center gap-[7px] rounded-full border border-[#333c26] bg-white/[.06] px-3 py-[5px]">
                            <span className="text-[11px] tracking-[.1em] text-[#8c9882]">
                                RUNNER CODE
                            </span>
                            <span className="font-stat font-bold tracking-[.06em] text-white">
                                {runner.runner_code}
                            </span>
                        </div>
                    </div>
                </div>

                {/* headline stats */}
                <div className="ml-auto grid w-full max-w-[360px] grid-cols-2 gap-2.5 sm:w-auto">
                    <StatTile
                        variant="dark-accent"
                        label="Total Distance"
                        value={runner.total_distance}
                        unit="KM"
                        className="min-w-0"
                    />
                    <StatTile
                        variant="dark"
                        label="Events Completed"
                        value={runner.events_completed}
                        className="min-w-0"
                    />
                    <StatTile
                        variant="dark"
                        label="Best Distance"
                        value={runner.best_km ?? 0}
                        unit="KM"
                        className="min-w-0"
                    />
                    <StatTile
                        variant="dark"
                        label="Best Rank"
                        value={
                            runner.best_rank != null
                                ? `#${runner.best_rank}`
                                : '—'
                        }
                        className="min-w-0"
                    />
                </div>
            </div>

            {/* personal details strip */}
            <div className="relative mt-6 flex flex-wrap gap-[clamp(18px,4vw,48px)] border-t border-[#28311c] pt-5">
                {personal.map((p) => (
                    <div key={p.label}>
                        <div className="mb-[3px] text-[10px] font-bold tracking-[.18em] text-[#717c63] uppercase">
                            {p.label}
                        </div>
                        <div className="text-[15px] font-semibold text-[#e7ece0]">
                            {p.value}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
