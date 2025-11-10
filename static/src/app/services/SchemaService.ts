import { API_URL } from "@/lib/api";
import { TableData } from "../types/schemaType";
import { toast } from "react-toastify";

export type SchemaResponse = Record<string, TableData>;

export async function fetchDatabaseSchema(): Promise<SchemaResponse> {
    try {
        const res = await fetch(`${API_URL}/db/schema`);
        if (!res.ok) throw new Error("Failed to fetch schema");
        const data = await res.json();
        toast.success("✅ Schema loaded successfully!");
        return data;
    } catch (error: any) {
        toast.error(`❌ Error loading schema: ${error.message}`);
        throw error;
    }
}

export async function fetchSchemas(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/db/schemas`);
        if (!res.ok) throw new Error("Failed to fetch schemas");
        const data = await res.json();
        toast.success("📂 Schemas loaded!");
        return data;
    } catch (error: any) {
        toast.error(`❌ Error loading schemas: ${error.message}`);
        throw error;
    }
}

export async function fetchTablesBySchema(schema: string = "public") {
    try {
        const res = await fetch(`${API_URL}/db/tables?schema=${schema}`);
        if (!res.ok) throw new Error("Failed to fetch tables");
        const data = await res.json();
        toast.success(`📊 Tables from schema "${schema}" loaded!`);
        return data;
    } catch (error: any) {
        toast.error(`❌ Error loading tables: ${error.message}`);
        throw error;
    }
}
