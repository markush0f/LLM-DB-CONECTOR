import { API_URL } from "@/lib/api";
import { TableData } from "../types/schemaType";


export type SchemaResponse = Record<string, TableData>;

/** Fetch schema from the active database connection */
export async function fetchDatabaseSchema(): Promise<SchemaResponse> {
    const res = await fetch(`${API_URL}/db/schema`);
    if (!res.ok) throw new Error("Failed to fetch schema");
    return await res.json();
}

export async function fetchSchemas(): Promise<string[]> {
    const res = await fetch(`${API_URL}/db/schemas`);
    if (!res.ok) throw new Error("Failed to fetch schemas");
    return await res.json();
}

export async function fetchTablesBySchema(schema: string = "public") {
    const res = await fetch(`${API_URL}/db/tables`);
    if (!res.ok) throw new Error("Failed to fetch tables");
    return await res.json();
}