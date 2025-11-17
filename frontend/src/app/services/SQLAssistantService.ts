import { toast } from "react-toastify";

const API_BASE = "http://localhost:8000/llmsql";

export interface GenerateSQLResponse {
    generated_sql: string;
    explanation: string;
    preview?: string;
}

export interface ExecuteSQLResponse {
    executed_sql: string;
    result: any;
}

/** 🔹 Generate SQL from natural language */
export async function generateSQL(userInput: string): Promise<GenerateSQLResponse> {
    try {
        const res = await fetch(`${API_BASE}/generate_sql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_input: userInput }),
        });

        if (!res.ok) {
            const err = await res.json();
            const message = err.detail || res.statusText;
            toast.error(`❌ Error generating SQL: ${message}`);
            throw new Error(message);
        }

        const data: GenerateSQLResponse = await res.json();
        toast.success("✅ SQL generated successfully!");
        return data; // 🔥 always return the structured object
    } catch (error: any) {
        console.error("⚠️ generateSQL() failed:", error);
        toast.error(`Error generating SQL: ${error.message}`);
        throw error;
    }
}

/** 🔹 Execute validated SQL */
export async function executeSQL(sql: string): Promise<ExecuteSQLResponse> {
    try {
        const res = await fetch(`${API_BASE}/execute_sql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql }),
        });

        if (!res.ok) {
            const err = await res.json();
            const message = err.detail || res.statusText;
            toast.error(`❌ SQL execution failed: ${message}`);
            throw new Error(message);
        }

        const data: ExecuteSQLResponse = await res.json();
        toast.success("💾 SQL executed successfully!");
        return data; // 🔥 this fixes TS2322
    } catch (error: any) {
        console.error("⚠️ executeSQL() failed:", error);
        toast.error(`Error executing SQL: ${error.message}`);
        throw error;
    }
}
