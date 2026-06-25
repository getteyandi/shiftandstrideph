import { ArrowRight, CalendarDays, Trophy } from 'lucide-react';

const DEFAULT_BANNER = 'linear-gradient(135deg,#1a2412,#0c0f0b)';

export default function EventCard({ event, onJoin }) {
    const {
        title,
        description,
        banner,
        start_date,
        end_date,
        status = 'Open',
        categories = [],
    } = event;

    const open = status.toLowerCase() === 'open';

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    return (
        <article className="overflow-hidden rounded-2xl border border-[#DFE3D6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            {/* Banner */}
            <div
                className="relative h-40 overflow-hidden"
                style={{
                    background: banner
                        ? `url(${banner}) center/cover`
                        : DEFAULT_BANNER,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <span
                    className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        open ? 'bg-lime text-ink-900' : 'bg-red-600 text-white'
                    }`}
                >
                    {status}
                </span>

                <div className="absolute right-4 bottom-4 left-4">
                    <h2 className="font-display text-3xl font-extrabold text-white italic">
                        {title}
                    </h2>
                </div>
            </div>

            <div className="space-y-5 p-5">
                {/* Description */}
                <p className="line-clamp-3 text-sm leading-6 text-[#666]">
                    {description}
                </p>

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm font-medium text-[#666]">
                    <CalendarDays size={16} />
                    <span>
                        {formatDate(start_date)} – {formatDate(end_date)}
                    </span>
                </div>

                {/* Categories */}
                <div>
                    <p className="mb-3 text-xs font-bold tracking-wider text-[#909090] uppercase">
                        Categories
                    </p>

                    <div className="space-y-3">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between rounded-xl border border-[#E6E9DD] bg-[#F8F9F5] p-3"
                            >
                                <div>
                                    <div className="font-display text-lg font-bold text-ink italic">
                                        {category.name}
                                    </div>

                                    <div className="mt-1 flex items-center gap-3 text-xs text-[#6b7261]">
                                        <span>{category.target_km} km</span>

                                        {category.ranking_enabled && (
                                            <span className="inline-flex items-center gap-1">
                                                <Trophy size={12} />
                                                Ranked
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onJoin(category.id)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-lime transition hover:bg-lime hover:text-ink-900"
                                >
                                    Join
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}
