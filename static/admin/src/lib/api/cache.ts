const API_URL = "http://localhost:8000/cache";

export async function fetchCache() {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/metadata/status`);
    return res.json();
}

export async function invalidateAllCache() {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/metadata/invalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
    });
    return res.json();
}

export async function invalidateSchema(schema: string) {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/metadata/invalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema_name: schema })
    });
    return res.json();
}

export async function invalidateTable(schema: string, table: string) {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/metadata/invalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema_name: schema, table_name: table })
    });
    return res.json();
}
