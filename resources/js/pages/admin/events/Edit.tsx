export default function Edit({ event }: any) {
    return (
        <div className="p-6">
            <h1>Edit Event</h1>

            <pre>
                {JSON.stringify(event, null, 2)}
            </pre>
        </div>
    );
}