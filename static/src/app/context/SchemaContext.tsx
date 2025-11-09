"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchDatabaseSchema, fetchSchemasList } from "../api/schema";
import { useConnections } from "./ConnectionsContext";

interface SchemaContextType {
    schema: any;
    schemasList: string[];
    selectedSchema: string | null;
    setSelectedSchema: React.Dispatch<React.SetStateAction<string | null>>;
    loading: boolean;
    error: string | null;
}

const SchemaContext = createContext<SchemaContextType | null>(null);

export const SchemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeConnection } = useConnections(); 
    const [schema, setSchema] = useState(null);
    const [schemasList, setSchemasList] = useState<string[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSchemas = async () => {
        if (!activeConnection) return; // No hacemos nada si no hay conexión
        setLoading(true);
        try {
            const list = await fetchSchemasList();
            setSchemasList(list);
            if (list.includes("public")) setSelectedSchema("public");
            setError(null);
        } catch (err: any) {
            setError(err.message || "Error loading schemas");
        } finally {
            setLoading(false);
        }
    };

    const loadSchema = async (schemaName?: string) => {
        if (!activeConnection) return; // 🚫 Igual: no hay conexión
        setLoading(true);
        try {
            const data = await fetchDatabaseSchema(schemaName);
            setSchema(data);
        } catch (err: any) {
            setError(err.message || "Error fetching schema");
        } finally {
            setLoading(false);
        }
    };

    // 🧠 Cargar lista de schemas solo cuando se activa una conexión
    useEffect(() => {
        if (activeConnection) {
            loadSchemas();
        }
    }, [activeConnection]);

    // 🧠 Cargar tablas del schema seleccionado
    useEffect(() => {
        if (selectedSchema && activeConnection) {
            loadSchema(selectedSchema);
        }
    }, [selectedSchema, activeConnection]);

    return (
        <SchemaContext.Provider
            value={{
                schema,
                schemasList,
                selectedSchema,
                setSelectedSchema,
                loading,
                error,
            }}
        >
            {children}
        </SchemaContext.Provider>
    );
};

export const useSchemas = () => useContext(SchemaContext);
