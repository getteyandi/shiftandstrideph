import {
    useEffect,
    useRef,
    useState
    
    
    
    
} from 'react';
import type {CSSProperties, ElementType, ReactNode, Ref} from 'react';

interface RevealProps {
    children: ReactNode;
    /** Rendered element/tag. Defaults to a div. */
    as?: ElementType;
    className?: string;
    /** Stagger delay in ms. */
    delay?: number;
    /** Vertical / horizontal travel in px before settling. */
    y?: number;
    x?: number;
    /** Transition duration in ms. */
    duration?: number;
    /** Reveal only once (default) or re-trigger every time it enters view. */
    once?: boolean;
    /**
     * External gate. When false, the element stays hidden even if in view — used
     * to hold hero content back until the preloader has finished.
     */
    active?: boolean;
    style?: CSSProperties;
}

const EASE = 'cubic-bezier(.22,.61,.36,1)';

/**
 * Lightweight entrance animation wrapper. Fades + slides its children into place
 * the first time they scroll into view (via IntersectionObserver), honouring
 * `prefers-reduced-motion`. Polymorphic through `as` so it can wrap list items,
 * headings, etc. without adding layout-breaking extra nodes.
 */
export default function Reveal({
    children,
    as,
    className,
    delay = 0,
    y = 26,
    x = 0,
    duration = 700,
    once = true,
    active = true,
    style,
}: RevealProps) {
    const Tag = (as ?? 'div') as ElementType;
    const ref = useRef<HTMLElement>(null);

    // Users who prefer reduced motion start "seen" — no travel, no fade-in.
    const [seen, setSeen] = useState(
        () =>
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );

    useEffect(() => {
        const el = ref.current;

        if (!el || seen) {
            return;
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSeen(true);

                    if (once) {
                        io.disconnect();
                    }
                } else if (!once) {
                    setSeen(false);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
        );

        io.observe(el);

        return () => io.disconnect();
        // `seen` is read only to skip setup when it starts true (reduced motion);
        // re-running on its change would needlessly tear down the observer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [once]);

    const shown = seen && active;

    return (
        <Tag
            ref={ref as Ref<HTMLElement>}
            className={className}
            style={{
                transition: `opacity ${duration}ms ${EASE}, transform ${duration}ms ${EASE}`,
                transitionDelay: `${delay}ms`,
                opacity: shown ? 1 : 0,
                transform: shown
                    ? 'none'
                    : `translate3d(${x}px, ${y}px, 0)`,
                willChange: 'opacity, transform',
                ...style,
            }}
        >
            {children}
        </Tag>
    );
}
