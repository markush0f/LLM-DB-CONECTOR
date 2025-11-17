import { useSchemas } from "@/app/context/SchemaContext";

export default function SchemasList() {
    const { schemas, selectedSchema, setSelectedSchema, loading } = useSchemas();

    if (loading) return <p className="p-3 text-gray-400 text-sm">Loading schemas...</p>;

    return (
        <ul className="p-3 space-y-1">
            {schemas.map((schema) => (
                <button
                    key={schema}
                    onClick={() => setSelectedSchema(schema)}
                    className={`cursor-pointer px-2 py-1 rounded text-sm border transition ${schema === selectedSchema
                        ? "bg-orange-100 border-orange-300 text-orange-700"
                        : "bg-white border-gray-100 hover:bg-gray-100"
                        }`}
                >
                    {schema}
                </button>
            ))}
        </ul>
    );
}
