import { ConnectionData } from "../types/connectionData";
import { toast } from "react-toastify";

interface NewConnection {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
    name: string;
}

const API_BASE = "http://localhost:8000";

/** 🔹 Fetch all saved connections */
export async function fetchConnections(): Promise<ConnectionData[]> {
    try {
        const res = await fetch(`${API_BASE}/connections/list`);
        if (!res.ok) throw new Error("Error fetching connections");

        const data = await res.json();
        toast.success("🔗 Connections loaded successfully!");
        return data.connections || [];
    } catch (error: any) {
        toast.error(`❌ Failed to load connections: ${error.message}`);
        throw error;
    }
}

/** 🔹 Create a new connection */
export async function createConnection(conn: ConnectionData) {
    const newConnection: NewConnection = {
        host: conn.host,
        port: conn.port,
        database: conn.database,
        user: conn.username,
        password: conn.password,
        name: conn.name,
    };

    try {
        const res = await fetch(`${API_BASE}/connections/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newConnection),
        });

        if (!res.ok) throw new Error("Error creating connection");

        const data = await res.json();
        toast.success(`✅ Connection "${conn.name}" created successfully!`);
        return data.connection || data;
    } catch (error: any) {
        toast.error(`❌ Failed to create connection: ${error.message}`);
        throw error;
    }
}

/** 🔹 Delete a connection */
export async function deleteConnection(id: number, name?: string) {
    try {
        const res = await fetch(`${API_BASE}/connections/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error deleting connection");
        toast.success(`🗑️ Connection "${name || id}" deleted successfully!`);
    } catch (error: any) {
        toast.error(`❌ Failed to delete connection: ${error.message}`);
        throw error;
    }
}

/** 🔹 Activate an existing connection */
export async function activateConnection(id: number, password: string, name?: string) {
    try {
        const res = await fetch(`${API_BASE}/connections/use/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        const data = await res.json();
        toast.success(`🚀 Connected to "${name || "database"}" successfully!`);
        return data;
    } catch (error: any) {
        toast.error(`❌ Error activating connection: ${error.message}`);
        throw error;
    }
}
