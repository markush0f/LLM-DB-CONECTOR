"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    fetchDatabaseSchema,
    fetchSchemasList,
    fetchTablesBySchema
} from "../api/schema";
import { useConnections } from "./ConnectionsContext";

interface SchemaContextType {
    schema: any;
    schemasList: string[];
    selectedSchema: string | null;
    setSelectedSchema: (schema: string) => void;
    loading: boolean;
    error: string | null;
    tables: string[];
    isLoadingTables: boolean;
    setTables: (tables: string[]) => void;
}

const SchemaContext = createContext<SchemaContextType>({
    schema: null,
    schemasList: [],
    selectedSchema: null,
    setSelectedSchema: () => { },
    loading: false,
    error: null,
    tables: [],
    isLoadingTables: false,
    setTables: () => { },
});

export const SchemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeConnection } = useConnections();
    const [schema, setSchema] = useState<any>(null);
    const [schemasList, setSchemasList] = useState<string[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tables, setTables] = useState<string[]>([]);
    const [isLoadingTables, setIsLoadingTables] = useState(false);

    // 🧩 Cargar todos los schemas al conectar
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

    // 🧩 Cargar estructura del schema
    const loadSchema = async (schemaName?: string) => {
        if (!activeConnection || !schemaName) return;
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

    // 🧩 Cargar las tablas de un schema
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
                schemasList,
                selectedSchema,
                setSelectedSchema,
                loading,
                error,
                tables,
                isLoadingTables,
                setTables
            }}
        >
            {children}
        </SchemaContext.Provider>
    );
};

export const useSchemas = () => useContext(SchemaContext);
