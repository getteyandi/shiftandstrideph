import { Link } from '@inertiajs/react';

export default function Index({ events }: any) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">
                Events
            </h1>

        <Link
            href="/admin/events/create"
            className="bg-blue-600 text-white px-4 py-2 rounded"
        >
            Create Event
        </Link>

            <pre>
                {JSON.stringify(events.data, null, 2)}
            </pre>
        </div>
    );
}