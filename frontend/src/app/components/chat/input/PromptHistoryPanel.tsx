import React from "react";
import { History, X } from "lucide-react";

interface Props {
    promptHistory: string[];
    setShowHistory: (v: boolean) => void;
    setValue: (v: string) => void;
    clearHistory: () => void;
}

// 🔹 History dropdown panel
export function PromptHistoryPanel({
    promptHistory,
    setShowHistory,
    setValue,
    clearHistory,
}: Props) {
    const handleHistoryClick = (prompt: string) => {
        setValue(prompt);
        setShowHistory(false);
    };

    return (
        <>
            <div className="fixed inset-0 z-10" onClick={() => setShowHistory(false)} />

            <div className="absolute right-0 bottom-full mb-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-hidden flex flex-col animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <History size={18} className="text-orange-500" />
                        <h3 className="font-semibold text-gray-800">Historial de Prompts</h3>
                    </div>
                    <div className="flex gap-2">
                        {promptHistory.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                            >
                                Limpiar
                            </button>
                        )}
                        <button
                            onClick={() => setShowHistory(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    {promptHistory.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <History size={48} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No hay prompts en el historial</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {promptHistory.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleHistoryClick(prompt)}
                                    className="w-full text-left p-4 hover:bg-orange-50 transition-colors group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2">
                                            {prompt}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
