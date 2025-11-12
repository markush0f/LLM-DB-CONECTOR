import React from "react";
import { X, Database } from "lucide-react";

interface Props {
    sqlQuery: string;
    setSqlQuery: (v: string) => void;
    queryResult: string | null;
    setShowSQLDialog: (v: boolean) => void;
    handleExecuteSQL: () => void;
}

// 🔹 SQL modal dialog
export function SQLDialog({
    sqlQuery,
    setSqlQuery,
    queryResult,
    setShowSQLDialog,
    handleExecuteSQL,
}: Props) {
    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setShowSQLDialog(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[650px] max-w-[95%] p-6 animate-slide-up">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Database className="text-blue-600" size={22} />
                            Ejecutar consulta SQL
                        </h2>
                        <button
                            onClick={() => setShowSQLDialog(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <textarea
                        rows={6}
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        placeholder="Escribe tu consulta SQL aquí..."
                        className="w-full p-4 border border-gray-200 rounded-lg font-mono text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-slate-50 resize-none"
                    />

                    <div className="flex justify-end gap-3 mt-5">
                        <button
                            onClick={() => setShowSQLDialog(false)}
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleExecuteSQL}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            Ejecutar
                        </button>
                    </div>

                    {queryResult && (
                        <div className="mt-5 bg-blue-50 text-blue-700 text-sm font-mono p-3 rounded-lg whitespace-pre-wrap border border-blue-100">
                            {queryResult}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
