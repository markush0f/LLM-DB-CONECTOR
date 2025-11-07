"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { SchemaResponse } from "../services/SchemaService";
import { fetchDatabaseSchema } from "../api/schema";

interface SchemaContextType {
    schema: SchemaResponse | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

const SchemaContext = createContext<SchemaContextType>({
    schema: null,
    loading: true,
    error: null,
    reload: async () => { },
});

export const SchemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [schema, setSchema] = useState<SchemaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSchema = async () => {
        console.log("🌀 [SchemaContext] Iniciando carga del esquema...");
        setLoading(true);
        try {
            console.log("📡 [SchemaContext] Haciendo fetch a /db/schema...");
            const data = await fetchDatabaseSchema();

            console.log("✅ [SchemaContext] Esquema recibido:", data);
            console.log("📊 [SchemaContext] Número de tablas:", Object.keys(data).length);

            setSchema(data);
            setError(null);
        } catch (err: any) {
            console.error("❌ [SchemaContext] Error al cargar el esquema:", err);
            setError(err.message || "Error fetching schema");
            setSchema(null);
        } finally {
            console.log("⏳ [SchemaContext] Finalizando carga. Estado -> loading = false");
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("🚀 [SchemaContext] useEffect inicial ejecutado (montaje del provider)");
        loadSchema();
    }, []);

    // Para debug visual, puedes ver en consola cada render:
    console.log(
        "🔁 [SchemaContext Render] Estado actual:",
        "\n  loading =", loading,
        "\n  error =", error,
        "\n  schema =", schema ? Object.keys(schema) : "null"
    );

    return (
        <SchemaContext.Provider value={{ schema, loading, error, reload: loadSchema }}>
            {children}
        </SchemaContext.Provider>
    );
};

export const useSchema = () => useContext(SchemaContext);
