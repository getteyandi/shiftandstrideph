import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Minimal first-paint loader: a lime lightning mark over a thin themed progress
 * bar. Holds briefly, then fades out and unmounts — flipping `onReveal` as the
 * exit begins so page content can animate in underneath. Respects
 * `prefers-reduced-motion` with a near-instant hold.
 */
export default function Preloader({ onReveal }: { onReveal?: () => void }) {
    const [exiting, setExiting] = useState(false);
    const [gone, setGone] = useState(false);

    useEffect(() => {
        const reduce = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const hold = reduce ? 200 : 1150;

        document.body.style.overflow = 'hidden';

        const timer = setTimeout(() => {
            setExiting(true);
            onReveal?.();
        }, hold);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = '';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (gone) {
        return null;
    }

    const finish = () => {
        if (!exiting) {
            return;
        }

        document.body.style.overflow = '';
        setGone(true);
    };

    return (
        <div
            aria-hidden
            onTransitionEnd={finish}
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0C08] transition-opacity duration-500 ease-out ${
                exiting ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <div className="flex flex-col items-center gap-4">
                <Zap
                    size={26}
                    strokeWidth={2}
                    className="text-lime [animation:preloaderPulse_1.2s_ease-in-out_infinite]"
                    style={{ fill: 'currentColor' }}
                />
                <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full w-full origin-left rounded-full bg-lime"
                        style={{
                            animation:
                                'preloaderFill 1.05s cubic-bezier(.5,.1,.2,1) forwards',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
