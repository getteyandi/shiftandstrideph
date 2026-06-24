import { router, useForm } from '@inertiajs/react';

export default function Index({
    events,
}: any) {
    const { post, setData, errors } = useForm({
    event_category_id: '',
    });

    const join = (categoryId: number) => {
        setData('event_category_id', categoryId.toString());

        post('/registrations');
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Available Events
            </h1>
        {errors.registration && (
            <div className="mb-4 rounded bg-red-500 px-4 py-2 text-white">
                {errors.registration}
            </div>
        )}
            {events.map((event: any) => (
                <div
                    key={event.id}
                    className="border p-4 mb-4"
                >
                    <h2 className="font-bold">
                        {event.title}
                    </h2>

                    {event.categories.map(
                        (category: any) => (
                            <div
                                key={category.id}
                                className="flex gap-4 mt-2"
                            >
                                <span>
                                    {category.name}
                                </span>

                                <button
                                    onClick={() => join(category.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Join
                                </button>
                            </div>
                        )
                    )}
                </div>
            ))}
        </div>
    );
}