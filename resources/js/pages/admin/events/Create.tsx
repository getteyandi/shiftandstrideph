import { useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        banner: '',
        start_date: '',
        end_date: '',
        status: 'draft',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/events');
    };

    return (
        <div className="max-w-2xl p-6">
            <h1 className="mb-6 text-2xl font-bold">Create Event</h1>

            <form onSubmit={submit} className="space-y-4">
                <input
                    className="w-full rounded border p-2"
                    placeholder="Title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                />

                <textarea
                    className="w-full rounded border p-2"
                    placeholder="Description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                />

                <input
                    type="date"
                    className="w-full rounded border p-2"
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                />

                <input
                    type="date"
                    className="w-full rounded border p-2"
                    value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)}
                />

                <select
                    className="w-full rounded border p-2"
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>

                <button
                    disabled={processing}
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                    Save Event
                </button>
            </form>
        </div>
    );
}
