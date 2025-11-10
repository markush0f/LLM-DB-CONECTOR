import { API_URL } from "@/lib/api";
import { TableData } from "../types/schemaType";
import { notifySuccess, notifyError, notifyInfo } from "@/lib/notify";

export type SchemaResponse = Record<string, TableData>;

/** 🔹 Obtener el esquema completo de la base de datos activa */
export async function fetchDatabaseSchema(): Promise<SchemaResponse> {
    try {
        const res = await fetch(`${API_URL}/db/schema`);
        if (!res.ok) throw new Error("Failed to fetch schema");

        const data = await res.json();
        notifySuccess("Schema loaded successfully");
        return data;
    } catch (error: any) {
        notifyError(`Error loading schema: ${error.message}`);
        throw error;
    }
}

/** 🔹 Obtener la lista de schemas disponibles */
export async function fetchSchemas(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/db/schemas`);
        if (!res.ok) throw new Error("Failed to fetch schemas");

        const data = await res.json();
        notifyInfo("Schemas list loaded");
        return data;
    } catch (error: any) {
        notifyError(`Error loading schemas: ${error.message}`);
        throw error;
    }
}

/** 🔹 Obtener las tablas de un schema específico */
export async function fetchTablesBySchema(schema: string = "public") {
    try {
        const res = await fetch(`${API_URL}/db/tables?schema=${schema}`);
        if (!res.ok) throw new Error("Failed to fetch tables");

        const data = await res.json();
        notifySuccess(`Tables from schema "${schema}" loaded`);
        return data;
    } catch (error: any) {
        notifyError(`Error loading tables: ${error.message}`);
        throw error;
    }
}
