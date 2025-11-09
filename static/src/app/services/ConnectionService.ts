import { ConnectionData } from "../types/connectionData";

interface NewConnection {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
    name: string
}
const API_BASE = "http://localhost:8000";

export async function fetchConnections(): Promise<ConnectionData[]> {
    const res = await fetch(`${API_BASE}/connections/list`);
    if (!res.ok) throw new Error("Error fetching connections");

    const data = await res.json();
    return data.connections || [];
}

export async function createConnection(conn: ConnectionData) {
    const newConnection: NewConnection = {
        host: conn.host,
        port: conn.port,
        database: conn.database,
        user: conn.username,
        password: conn.password,
        name: conn.name
    }
    const res = await fetch(`${API_BASE}/connections/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConnection),
    });

    if (!res.ok) throw new Error("Error creating connection");
    return res.json();
}

export async function deleteConnection(id: number) {
    const res = await fetch(`${API_BASE}/connections/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error deleting connection");
}

export async function activateConnection(id: number, password: string) {
    console.log(`Activando conexión ${id} con password fijo`);

    const res = await fetch(`http://localhost:8000/connections/use/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "password" }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Error activating connection: ${err}`);
    }

    const data = await res.json();
    console.log("✅ Conexión activada:", data);
    return data;
}
