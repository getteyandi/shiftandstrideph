import { useForm } from '@inertiajs/react';

export default function Create({
    events,
}: any) {
    const { data, setData, post } = useForm({
        event_id: '',
        name: '',
        target_km: '',
        ranking_enabled: true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/admin/event-categories');
    }

    return (
        <form
            onSubmit={submit}
            className="p-6 space-y-4"
        >
            <select
                value={data.event_id}
                onChange={(e) =>
                    setData(
                        'event_id',
                        e.target.value
                    )
                }
            >
                <option value="">
                    Select Event
                </option>

                {events.map((event: any) => (
                    <option
                        key={event.id}
                        value={event.id}
                    >
                        {event.title}
                    </option>
                ))}
            </select>

            <input
                placeholder="Category Name"
                value={data.name}
                onChange={(e) =>
                    setData('name', e.target.value)
                }
            />

            <input
                type="number"
                placeholder="Target KM"
                value={data.target_km}
                onChange={(e) =>
                    setData(
                        'target_km',
                        e.target.value
                    )
                }
            />

            <label>
                <input
                    type="checkbox"
                    checked={
                        data.ranking_enabled
                    }
                    onChange={(e) =>
                        setData(
                            'ranking_enabled',
                            e.target.checked
                        )
                    }
                />
                Ranking Enabled
            </label>

            <button type="submit">
                Save Category
            </button>
        </form>
    );
}