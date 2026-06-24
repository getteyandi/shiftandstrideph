import { router } from '@inertiajs/react';

export default function Index({
    users,
}: any) {
    const approve = (id: number) => {
        router.patch(
            `/admin/users/${id}/approve`
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                User Approval
            </h1>

            {users.map((user: any) => (
                <div
                    key={user.id}
                    className="border p-4 mb-4"
                >
                    <p>
                        {user.first_name}{' '}
                        {user.last_name}
                    </p>

                    <p>{user.email}</p>

                    <p>
                        Status: {user.status}
                    </p>

                    {user.status ===
                        'pending' && (
                        <button
                            onClick={() =>
                                approve(
                                    user.id
                                )
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                            Approve
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}