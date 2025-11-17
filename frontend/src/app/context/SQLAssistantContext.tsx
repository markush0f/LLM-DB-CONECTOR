"use client";
import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    ReactNode,
} from "react";
import { toast } from "react-toastify";
import { useSchemas } from "./SchemaContext";
import {
    generateSQL,
    executeSQL,
    GenerateSQLResponse,
    ExecuteSQLResponse,
} from "../services/SQLAssistantService";

interface SQLAssistantContextType {
    input: string;
    setInput: (v: string) => void;

    loading: boolean;
    generatedSQL: string;
    explanation: string;
    result: any;

    promptHistory: string[];
    addPromptToHistory: (prompt: string) => void;
    clearHistory: () => void;

    handleGenerateSQL: () => Promise<void>;
    handleExecuteSQL: () => Promise<void>;
}

const SQLAssistantContext = createContext<SQLAssistantContextType>(
    {} as SQLAssistantContextType
);

export const SQLAssistantProvider = ({ children }: { children: ReactNode }) => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedSQL, setGeneratedSQL] = useState("");
    const [explanation, setExplanation] = useState("");
    const [result, setResult] = useState<any>(null);
    const [promptHistory, setPromptHistory] = useState<string[]>([]);

    const { selectedSchema, setSelectedSchema } = useSchemas(); // para refrescar el diagrama


    const addPromptToHistory = (prompt: string): void => {
        setPromptHistory((prev) => [prompt, ...prev]);
    };

    const clearHistory = (): void => setPromptHistory([]);

    const handleGenerateSQL = async (): Promise<void> => {
        if (!input.trim()) {
            toast.info("Please enter a prompt first");
            return;
        }

        setLoading(true);

        try {
            addPromptToHistory(input);

            const response: GenerateSQLResponse = await generateSQL(input);

            setGeneratedSQL(response.generated_sql);
            setExplanation(response.explanation);
            toast.success("SQL generated successfully!");
        } catch (err: any) {
            toast.error(`Error generating SQL: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteSQL = async (): Promise<void> => {
        if (!generatedSQL.trim()) {
            toast.info("No SQL to execute");
            return;
        }

        setLoading(true);

        try {
            const res: ExecuteSQLResponse = await executeSQL(generatedSQL);

            setResult(res.result);
            toast.success("SQL executed successfully!");

            // Actualizar diagrama automáticamente
            if (selectedSchema) {
                setSelectedSchema(selectedSchema);
            }
        } catch (err: any) {
            toast.error(`Error executing SQL: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const contextValue = useMemo<SQLAssistantContextType>(
        () => ({
            input,
            setInput,
            loading,
            generatedSQL,
            explanation,
            result,
            promptHistory,
            addPromptToHistory,
            clearHistory,
            handleGenerateSQL,
            handleExecuteSQL,
        }),
        [
            input,
            loading,
            generatedSQL,
            explanation,
            result,
            promptHistory,
        ]
    );

    return (
        <SQLAssistantContext.Provider value={contextValue}>
            {children}
        </SQLAssistantContext.Provider>
    );
};

export const useSQLAssistant = () => useContext(SQLAssistantContext);
