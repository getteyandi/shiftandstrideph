// tone="light"  -> white card with optional color glow (admin stat tiles)
// tone="dark"   -> dark hero tile; accent=true paints the lime variant
export default function StatTile({
    label,
    value,
    unit,
    glow,
    tone = 'light',
    accent = false,
    className = '',
}) {
    if (tone === 'dark') {
        return (
            <div
                className={`min-w-[140px] rounded-2xl border px-[22px] py-4 ${
                    accent
                        ? 'border-lime/35 bg-lime/10'
                        : 'border-[#2f3823] bg-white/[.04]'
                } ${className}`}
            >
                <div
                    className={`text-[10.5px] font-bold tracking-[.16em] uppercase ${accent ? 'text-lime' : 'text-[#8c9882]'}`}
                >
                    {label}
                </div>
                <div className="mt-1 font-display text-[clamp(34px,4vw,46px)] leading-none font-extrabold text-white italic">
                    {value}
                    {unit && (
                        <span className="ml-1 text-base text-[#8c9882] not-italic">
                            {unit}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-[#DFE3D6] bg-white px-5 py-[18px] ${className}`}
        >
            {glow && (
                <div
                    className="absolute -top-1.5 -right-1.5 h-[60px] w-[60px] rounded-full opacity-50 blur-[18px]"
                    style={{ background: glow }}
                />
            )}
            <div className="relative text-[10.5px] font-bold tracking-[.14em] text-[#9aa18d] uppercase">
                {label}
            </div>
            <div className="relative mt-1 font-display text-[40px] leading-none font-extrabold text-ink italic">
                {value}
            </div>
        </div>
    );
}
