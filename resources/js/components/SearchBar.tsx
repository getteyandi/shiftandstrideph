import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SearchBarProps {
    /** Current search term from the server (URL), used as the initial value. */
    initial?: string;
    placeholder?: string;
    /** Called (debounced) with the trimmed term whenever the user types. */
    onSearch: (term: string) => void;
    className?: string;
}

/**
 * Debounced search input. Presentational only — the parent decides where to
 * navigate in `onSearch`, so it can preserve its own filters/params. Kept
 * mounted across Inertia visits (preserveState) so focus and text survive.
 */
export default function SearchBar({
    initial = '',
    placeholder = 'Search…',
    onSearch,
    className,
}: SearchBarProps) {
    const [term, setTerm] = useState(initial);

    // Keep the latest callback without making it a debounce dependency.
    const cb = useRef(onSearch);
    cb.current = onSearch;

    // Don't fire on first mount — the list already reflects the initial term.
    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        const timer = setTimeout(() => cb.current(term.trim()), 350);
        return () => clearTimeout(timer);
    }, [term]);

    return (
        <div className={cn('relative w-full sm:max-w-xs', className)}>
            <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
            />
            <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-9 text-sm text-ink outline-none transition focus:border-lime"
            />
            {term && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 transition hover:text-ink"
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
}
