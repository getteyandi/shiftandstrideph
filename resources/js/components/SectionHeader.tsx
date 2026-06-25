export default function SectionHeader({
    title,
    children,
    titleClassName = 'text-ink',
    className = '',
}) {
    return (
        <div className={`mt-1 mb-4 flex items-center gap-[11px] ${className}`}>
            <span className="h-[22px] w-2 shrink-0 -skew-x-12 rounded-sm bg-lime" />
            <h2
                className={`m-0 font-display text-[23px] font-bold tracking-[.01em] uppercase italic ${titleClassName}`}
            >
                {title}
            </h2>
            {children != null && <div className="ml-auto">{children}</div>}
        </div>
    );
}
