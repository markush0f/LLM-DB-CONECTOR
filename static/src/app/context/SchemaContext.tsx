"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useConnections } from "./ConnectionsContext";
import { fetchSchemas } from "../services/SchemaService";

interface SchemasContextType {
    schemas: string[];
    selectedSchema: string | null;
    setSelectedSchema: (s: string) => void;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

const SchemasContext = createContext<SchemasContextType>({
    schemas: [],
    selectedSchema: null,
    setSelectedSchema: () => { },
    loading: false,
    error: null,
    reload: async () => { },
});

export const SchemasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeConnection } = useConnections();
    const [schemas, setSchemas] = useState<string[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSchemas = async () => {
        if (!activeConnection) return;
        console.log("🌀 Cargando schemas para:", activeConnection.name);
        setLoading(true);
        try {
            const data = await fetchSchemas();
            setSchemas(data);
            setError(null);
            if (data.includes("public")) setSelectedSchema("public");
        } catch (err: any) {
            console.error("❌ Error al cargar schemas:", err);
            setError(err.message);
            setSchemas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchemas();
    }, [activeConnection]);

    return (
        <SchemasContext.Provider
            value={{ schemas, selectedSchema, setSelectedSchema, loading, error, reload: loadSchemas }}
        >
            {children}
        </SchemasContext.Provider>
    );
};

export const useSchemas = () => useContext(SchemasContext);
