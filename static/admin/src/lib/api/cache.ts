const API_URL = "http://localhost:8000";

export async function fetchCache() {
    const res = await fetch(`${API_URL}/admin/cache`);
    return res.json();
}

export async function clearAllCache() {
    const res = await fetch(`${API_URL}/admin/cache`, {
        method: "DELETE",
    });
    return res.json();
}

export async function clearSchema(schema: string) {
    const res = await fetch(`${API_URL}/admin/cache/${schema}`, {
        method: "DELETE",
    });
    return res.json();
}

export async function clearTable(schema: string, table: string) {
    const res = await fetch(`${API_URL}/admin/cache/${schema}/${table}`, {
        method: "DELETE",
    });
    return res.json();
}
