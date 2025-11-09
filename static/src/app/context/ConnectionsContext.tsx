"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    fetchConnections,
    createConnection,
    deleteConnection,
} from "../services/ConnectionService";
import { ConnectionData } from "../types/connectionData";


interface ConnectionsContextType {
    connections: ConnectionData[];
    loading: boolean;
    error: string | null;
    activeConnection: ConnectionData | null;
    setActiveConnection: (conn: ConnectionData) => void;
    reload: () => Promise<void>;
    addConnection: (conn: ConnectionData) => Promise<void>;
    removeConnection: (id: number) => Promise<void>;
}

const ConnectionsContext = createContext<ConnectionsContextType>({
    connections: [],
    loading: true,
    error: null,
    activeConnection: null,
    setActiveConnection: () => { },
    reload: async () => { },
    addConnection: async () => { },
    removeConnection: async () => { },
});

export const ConnectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connections, setConnections] = useState<ConnectionData[]>([]);
    const [activeConnection, setActiveConnection] = useState<ConnectionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadConnections = async () => {
        console.log("🌀 [ConnectionsContext] Iniciando carga de conexiones...");
        setLoading(true);
        try {
            const data = await fetchConnections();
            console.log("✅ [ConnectionsContext] Conexiones recibidas:", data);
            setConnections(data);
            setError(null);
        } catch (err: any) {
            console.error("❌ [ConnectionsContext] Error al cargar conexiones:", err);
            setError(err.message || "Error loading connections");
        } finally {
            setLoading(false);
        }
    };

    const addConnection = async (conn: ConnectionData) => {
        console.log(" [ConnectionsContext] Creando nueva conexión:", conn);
        const response = await createConnection(conn);
        const newConn = response.connection;
        setConnections((prev) => [...prev, newConn]);
    };


    const removeConnection = async (id: number) => {
        console.log(`[ConnectionsContext] Eliminando conexión ID=${id}...`);
        await deleteConnection(id);
        setConnections((prev) => prev.filter((c) => c.id !== id));
        if (activeConnection?.id === id) {
            setActiveConnection(null);
            console.log("⚠️ [ConnectionsContext] Conexión activa eliminada, reseteada a null");
        }
    };

    useEffect(() => {
        loadConnections();
    }, []);

    console.log(
        "🔁 [ConnectionsContext Render]",
        "\nconnections:", connections.map((c) => c.name),
        "\nactive:", activeConnection?.name
    );

    return (
        <ConnectionsContext.Provider
            value={{
                connections,
                loading,
                error,
                activeConnection,
                setActiveConnection,
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
