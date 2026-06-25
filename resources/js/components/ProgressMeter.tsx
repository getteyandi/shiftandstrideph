// Animated fill. Defaults match the light app; pass track/fill classes for dark contexts.
export default function ProgressMeter({
    pct = 0,
    height = 10,
    trackClassName = 'bg-[#EAEEE2]',
    fillClassName = 'bg-gradient-to-r from-lime-deep via-lime to-lime-bright',
    className = '',
}) {
    const w = Math.min(100, Math.max(0, pct));
    return (
        <div
            className={`overflow-hidden rounded-full ${trackClassName} ${className}`}
            style={{ height }}
        >
            <div
                className={`h-full origin-left animate-grow rounded-full ${fillClassName}`}
                style={{ width: `${w}%` }}
            />
        </div>
    );
}
