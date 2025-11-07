import { API_URL } from "@/lib/api";
import { TableData } from "../types/schemaType";


export type SchemaResponse = Record<string, TableData>;

/** Fetch schema from the active database connection */
export async function fetchDatabaseSchema(): Promise<SchemaResponse> {
    const res = await fetch(`${API_URL}/db/schema`);
    if (!res.ok) throw new Error("Failed to fetch schema");
    return await res.json();
}
