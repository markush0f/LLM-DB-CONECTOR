
export async function fetchDatabaseSchema(schema?: string) {
    const query = schema ? `?schema=${schema}` : "";
    const res = await fetch(`http://localhost:8000/db/schema${query}`, {
        method: "GET",
    });

    if (!res.ok) {
        throw new Error(`Error fetching schema: ${res.statusText}`);
    }

    return res.json();
}


export async function fetchSchemasList() {
    const res = await fetch("http://localhost:8000/db/schemas", { method: "GET" });
    if (!res.ok) throw new Error("Error fetching schemas");
    return res.json();
}