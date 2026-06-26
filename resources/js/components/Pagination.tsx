import { Link } from '@inertiajs/react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}

/**
 * Inertia-aware pagination control driven by a Laravel paginator's `links`.
 * Preserves scroll + state so it slots into any list without a full reload.
 */
export default function Pagination<T>({
    paginator,
    className = '',
}: {
    paginator: Paginator<T>;
    className?: string;
}) {
    const { links } = paginator;

    // Only one page (prev · 1 · next) → nothing worth showing.
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div
            className={`mt-5 flex flex-wrap items-center justify-between gap-3 ${className}`}
        >
            {(paginator.total ?? 0) > 0 && (
                <span className="text-xs font-semibold text-muted">
                    Showing {paginator.from ?? 0}–{paginator.to ?? 0} of{' '}
                    {paginator.total}
                </span>
            )}

            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, i) =>
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition ${
                                link.active
                                    ? 'border-lime bg-lime text-[#12150d]'
                                    : 'border-line bg-card text-[#5A6152] hover:border-lime hover:text-lime'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-line px-2.5 text-sm font-semibold text-[#c0c5b8]"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
