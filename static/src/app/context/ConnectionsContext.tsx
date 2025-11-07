"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    DBConnection,
    fetchConnections,
    createConnection,
    deleteConnection,
} from "../services/ConnectionService";

interface ConnectionsContextType {
    connections: DBConnection[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    addConnection: (conn: Omit<DBConnection, "id" | "created_at">) => Promise<void>;
    removeConnection: (id: number) => Promise<void>;
}

const ConnectionsContext = createContext<ConnectionsContextType>({
    connections: [],
    loading: true,
    error: null,
    reload: async () => { },
    addConnection: async () => { },
    removeConnection: async () => { },
});

export const ConnectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connections, setConnections] = useState<DBConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadConnections = async () => {
        console.log("🌀 [ConnectionsContext] Iniciando carga de conexiones...");
        setLoading(true);
        try {
            console.log("📡 [ConnectionsContext] Fetching desde backend...");
            const data = await fetchConnections();
            console.log("✅ [ConnectionsContext] Conexiones recibidas:", data);
            setConnections(data);
            setError(null);
        } catch (err: any) {
            console.error("❌ [ConnectionsContext] Error al cargar conexiones:", err);
            setError(err.message || "Error loading connections");
        } finally {
            console.log("⏳ [ConnectionsContext] Finalizando carga. Estado -> loading = false");
            setLoading(false);
        }
    };

    const addConnection = async (conn: Omit<DBConnection, "id" | "created_at">) => {
        console.log("➕ [ConnectionsContext] Creando nueva conexión:", conn);
        try {
            const newConn = await createConnection(conn);
            console.log("✅ [ConnectionsContext] Conexión creada con éxito:", newConn);
            setConnections((prev) => [...prev, newConn]);
        } catch (err: any) {
            console.error("❌ [ConnectionsContext] Error al crear conexión:", err);
            setError(err.message || "Error creating connection");
        }
    };

    const removeConnection = async (id: number) => {
        console.log(`🗑️ [ConnectionsContext] Eliminando conexión ID=${id}...`);
        try {
            await deleteConnection(id);
            console.log(`✅ [ConnectionsContext] Conexión ${id} eliminada.`);
            setConnections((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            console.error(`❌ [ConnectionsContext] Error al eliminar conexión ${id}:`, err);
            setError(err.message || "Error deleting connection");
        }
    };

    useEffect(() => {
        console.log("🚀 [ConnectionsContext] Montado. Cargando conexiones iniciales...");
        loadConnections();
    }, []);

    // 👀 Log en cada render (útil para depuración de re-renders)
    console.log(
        "🔁 [ConnectionsContext Render] Estado actual:",
        "\n  loading =", loading,
        "\n  error =", error,
        "\n  connections =", connections.map((c) => c.name)
    );

    return (
        <ConnectionsContext.Provider
            value={{
                connections,
                loading,
                error,
                reload: loadConnections,
                addConnection,
                removeConnection,
            }}
        >
            {children}
        </ConnectionsContext.Provider>
    );
};

export const useConnections = () => useContext(ConnectionsContext);
