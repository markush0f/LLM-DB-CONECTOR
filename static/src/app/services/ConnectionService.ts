export interface DBConnection {
    id: number;
    name: string;
    host: string;
    port: number;
    user: string;
    database: string;
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchConnections(): Promise<DBConnection[]> {
    console.log("📡 [ConnectionService] Fetching connections from backend...");
    const res = await fetch(`${API_URL}/connections/list`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Error fetching connections: ${res.status}`);

    const data = await res.json();
    console.log("🧩 [ConnectionService] Raw response:", data);

    // ✅ Adaptamos al formato del backend
    if (Array.isArray(data)) return data;
    if (data.connections && Array.isArray(data.connections)) return data.connections;

    console.warn("⚠️ [ConnectionService] Unexpected format, returning empty array");
    return [];
}

export async function deleteConnection(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/connections/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error deleting connection");
}

export async function createConnection(data: Omit<DBConnection, "id" | "created_at">): Promise<DBConnection> {
    const res = await fetch(`${API_URL}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error creating connection");
    return res.json();
}


export async function activateConnection(id: number, password?: string): Promise<void> {
    console.log(`🎯 [ConnectionService] Activando conexión ID=${id}...`);

    const res = await fetch(`${API_URL}/connections/use/${id}?password=${password || ""}`, {
        method: "POST",
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Error activating connection: ${msg}`);
    }

    console.log(`✅ [ConnectionService] Conexión ${id} activada correctamente.`);
}

