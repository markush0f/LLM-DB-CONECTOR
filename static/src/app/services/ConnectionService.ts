export interface DBConnection {
    id: number;
    name: string;
    host: string;
    port: number;
    user: string;
    database: string;
    created_at: string;
}

const API_BASE = "http://localhost:8000";

/* 🔹 Obtener todas las conexiones guardadas */
export async function fetchConnections(): Promise<DBConnection[]> {
    const res = await fetch(`${API_BASE}/connections/list`);
    if (!res.ok) throw new Error("Error fetching connections");

    const data = await res.json();
    return data.connections || [];
}

/* 🔹 Crear una nueva conexión */
export async function createConnection(conn: Omit<DBConnection, "id" | "created_at">) {
    const res = await fetch(`${API_BASE}/connections/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conn),
    });

    if (!res.ok) throw new Error("Error creating connection");
    return res.json();
}

/* 🔹 Eliminar una conexión */
export async function deleteConnection(id: number) {
    const res = await fetch(`${API_BASE}/connections/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error deleting connection");
}

/* 🔹 Activar una conexión existente */
export async function activateConnection(id: number, password: string) {
    console.log(`⚙️ Activando conexión ${id} con password fijo`);

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
