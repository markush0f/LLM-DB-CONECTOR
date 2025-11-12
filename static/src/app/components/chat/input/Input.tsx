"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";

import { PromptInput } from "./PromptInput";
import { PromptHistoryPanel } from "./PromptHistoryPanel";
import { SQLDialog } from "./SqlDialog";

export default function Input() {
    // Global state
    const [value, setValue] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [showSQLDialog, setShowSQLDialog] = useState(false);
    const [sqlQuery, setSqlQuery] = useState("");
    const [queryResult, setQueryResult] = useState<string | null>(null);

    const [promptHistory, setPromptHistory] = useState<string[]>([
        "Crear diagrama de base de datos para e-commerce",
        "Agregar tabla de categorías",
        "Mostrar relaciones entre usuarios y pedidos",
        "Cambiar colores a naranja",
    ]);

    // Submit handler
    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (value.trim()) {
            console.log("Enviado:", value);
            setPromptHistory((prev) => [value, ...prev]);
            setValue("");
        }
    };

    // SQL simulation
    const handleExecuteSQL = () => {
        if (!sqlQuery.trim()) return;
        setQueryResult(`✅ Consulta ejecutada correctamente:\n${sqlQuery}`);
        setSqlQuery("");
    };

    return (
        <div className="relative w-full border-t border-gray-100 bg-slate-50 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto relative">
                <PromptInput
                    value={value}
                    setValue={setValue}
                    onSubmit={handleSubmit}
                    promptHistory={promptHistory}
                    setShowHistory={setShowHistory}
                    setShowSQLDialog={setShowSQLDialog}
                />

                {showHistory && (
                    <PromptHistoryPanel
                        promptHistory={promptHistory}
                        setShowHistory={setShowHistory}
                        setValue={setValue}
                        clearHistory={() => setPromptHistory([])}
                    />
                )}

                {showSQLDialog &&
                    createPortal(
                        <SQLDialog
                            sqlQuery={sqlQuery}
                            setSqlQuery={setSqlQuery}
                            queryResult={queryResult}
                            setShowSQLDialog={setShowSQLDialog}
                            handleExecuteSQL={handleExecuteSQL}
                        />,
                        document.body
                    )}
            </div>
        </div>
    );
}
