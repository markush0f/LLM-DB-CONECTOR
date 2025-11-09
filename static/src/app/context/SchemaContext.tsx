"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchDatabaseSchema, fetchSchemasList } from "../api/schema";
import { useConnections } from "./ConnectionsContext";

interface SchemaContextType {
    schema: any;
    schemasList: string[];
    selectedSchema: string | null;
    setSelectedSchema: (schema: string) => void;
    loading: boolean;
    error: string | null;
}

const SchemaContext = createContext<SchemaContextType>({
    schema: null,
    schemasList: [],
    selectedSchema: null,
    setSelectedSchema: () => { },
    loading: false,
    error: null,
});

export const SchemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeConnection } = useConnections(); // Saber si hay conexión activa
    const [schema, setSchema] = useState<any>(null);
    const [schemasList, setSchemasList] = useState<string[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setSchema(data);
        } catch (err: any) {
            setError(err.message || "Error fetching schema");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeConnection) loadSchemas();
    }, [activeConnection]);

    useEffect(() => {
        if (activeConnection && selectedSchema) loadSchema(selectedSchema);
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
