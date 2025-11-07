import { API_URL } from "@/lib/api";

export async function fetchDatabaseSchema() {
    const response = await fetch(`${API_URL}/db/schema`);
    if (!response.ok) throw new Error("Failed to fetch database schema");
    return await response.json();
}
