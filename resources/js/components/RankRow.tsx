function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
}

// Dark leaderboard row. row: { name, city, scope, km, is_me }
export default function RankRow({ rank, name, city, scope, km, me = false }) {
    const top = rank <= 3;
    const rowBg = me
        ? 'bg-lime/[.08]'
        : top
          ? 'bg-white/[.035]'
          : 'bg-transparent';
    const rowBorder = me ? 'border-lime/40' : 'border-[#1c2114]';
    const rankColor =
        rank === 1 ? 'text-lime' : top ? 'text-white' : 'text-[#5f6a52]';
    const kmColor = top ? 'text-lime' : 'text-[#dfe6d4]';
    const ring = top ? 'border-lime' : 'border-[#2a3320]';

    return (
        <div
            className={`flex items-center rounded-[14px] border px-5 py-3.5 ${rowBg} ${rowBorder}`}
        >
            <div
                className={`w-12 font-display text-[22px] font-extrabold italic ${rankColor}`}
            >
                {rank}
            </div>
            <div className="flex flex-1 items-center gap-3.5">
                <div
                    className={`h-10 w-10 rounded-[11px] border-[1.5px] ${ring} flex shrink-0 items-center justify-center bg-[linear-gradient(145deg,#222a18,#0c0f0b)] font-display text-[15px] font-bold text-white`}
                >
                    {initials(name)}
                </div>
                <div>
                    <div className="text-[15px] font-bold text-white">
                        {name}
                    </div>
                    <div className="text-xs text-[#8c9882]">{city}</div>
                </div>
            </div>
            <div className="w-[90px] text-right font-semibold text-[#b6bfaa]">
                {scope}
            </div>
            <div
                className={`w-[110px] text-right font-display text-[22px] font-extrabold italic ${kmColor}`}
            >
                {km}
            </div>
        </div>
    );
}
