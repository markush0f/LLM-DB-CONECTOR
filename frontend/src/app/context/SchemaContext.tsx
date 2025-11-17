"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import diff from "microdiff";
import {
    fetchDatabaseSchema,
    fetchSchemasList,
    fetchTablesBySchema,
} from "../api/schema";
import { useConnections } from "./ConnectionsContext";
import { DatabaseSchema } from "@/app/types/diagramData";

interface SchemaContextType {
    schema: DatabaseSchema | null;
    prevSchema: DatabaseSchema | null; // ✅ nuevo
    changedTables: string[]; // ✅ nuevo
    schemasList: string[];
    selectedSchema: string | null;
    setSelectedSchema: (schema: string) => void;
    loading: boolean;
    error: string | null;
    tables: string[];
    isLoadingTables: boolean;
    setTables: (tables: string[]) => void;
    refreshSchema: () => Promise<void>; // ✅ nuevo
}

const SchemaContext = createContext<SchemaContextType>({
    schema: null,
    prevSchema: null,
    changedTables: [],
    schemasList: [],
    selectedSchema: null,
    setSelectedSchema: () => { },
    loading: false,
    error: null,
    tables: [],
    isLoadingTables: false,
    setTables: () => { },
    refreshSchema: async () => { },
});

export const SchemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeConnection } = useConnections();
    const [schema, setSchema] = useState<DatabaseSchema | null>(null);
    const [prevSchema, setPrevSchema] = useState<DatabaseSchema | null>(null);
    const [changedTables, setChangedTables] = useState<string[]>([]);
    const [schemasList, setSchemasList] = useState<string[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tables, setTables] = useState<string[]>([]);
    const [isLoadingTables, setIsLoadingTables] = useState(false);

    const loadSchemas = async () => {
        if (!activeConnection) return;
        setLoading(true);
        try {
            const list = await fetchSchemasList();
            setSchemasList(list);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Error loading schemas");
        } finally {
            setLoading(false);
        }
    };

    const loadSchema = async (schemaName?: string) => {
        if (!activeConnection || !schemaName) return;
        setLoading(true);
        try {
            const data = await fetchDatabaseSchema(schemaName);
            setSchema(data as DatabaseSchema);
        } catch (err: any) {
            setError(err.message || "Error fetching schema");
        } finally {
            setLoading(false);
        }
    };

    const loadTables = async (schemaName: string) => {
        if (!activeConnection) return;
        setIsLoadingTables(true);
        try {
            const data = await fetchTablesBySchema(schemaName);
            setTables(data);
        } catch (err: any) {
            console.error("❌ Error fetching tables:", err);
            setError(err.message || "Error loading tables");
        } finally {
            setIsLoadingTables(false);
        }
    };

    // Nuevo: refrescar esquema y detectar diferencias
    const refreshSchema = async () => {
        if (!selectedSchema || !activeConnection) return;
        setPrevSchema(schema); // guarda el actual
        try {
            const newSchema = (await fetchDatabaseSchema(selectedSchema)) as DatabaseSchema;

            // Detecta diferencias con el anterior
            if (schema) {
                const changes = diff(schema, newSchema)
                    .map((c) => c.path[0]) 
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .filter((v): v is string => typeof v === 'string');
                setChangedTables(changes);
            }

            setSchema(newSchema);
        } catch (err: any) {
            console.error("Error refreshing schema:", err);
        }
    };

    useEffect(() => {
        if (activeConnection) loadSchemas();
    }, [activeConnection]);

    useEffect(() => {
        if (activeConnection && selectedSchema) {
            loadSchema(selectedSchema);
            loadTables(selectedSchema);
        }
    }, [selectedSchema, activeConnection]);

    return (
        <SchemaContext.Provider
            value={{
                schema,
                prevSchema,
                changedTables,
                schemasList,
                selectedSchema,
                setSelectedSchema,
                loading,
                error,
                tables,
                isLoadingTables,
                setTables,
                refreshSchema, // ✅ ahora accesible desde fuera
            }}
        >
            {children}
        </SchemaContext.Provider>
    );
};

export const useSchemas = () => useContext(SchemaContext);
