import { API_URL } from "@/lib/api";

export interface Column {
    name: string;
    type: string;
    nullable: string;
    default: string | null;
}

export interface ForeignKey {
    column: string;
    ref_table: string;
    ref_column: string;
}

export interface TableData {
    columns: Column[];
    primary_keys: string[];
    foreign_keys: ForeignKey[];
}

export type SchemaResponse = Record<string, TableData>;

/** Fetch schema from the active database connection */
export async function fetchDatabaseSchema(): Promise<SchemaResponse> {
    const res = await fetch(`${API_URL}/db/schema`);
    if (!res.ok) throw new Error("Failed to fetch schema");
    return await res.json();
}
