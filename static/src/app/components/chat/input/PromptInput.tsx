import React from "react";
import { Send, History, Database } from "lucide-react";

interface Props {
    value: string;
    setValue: (v: string) => void;
    onSubmit: (e?: React.FormEvent) => void;
    promptHistory: string[];
    setShowHistory: (v: boolean) => void;
    setShowSQLDialog: (v: boolean) => void;
}

// 🔹 Input + buttons UI
export function PromptInput({
    value,
    setValue,
    onSubmit,
    promptHistory,
    setShowHistory,
    setShowSQLDialog,
}: Props) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit(e);
                    }
                }}
                placeholder="Escribe tu mensaje..."
                className="w-full px-6 py-4 pr-40 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 rounded-2xl shadow-lg shadow-gray-200/50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:shadow-xl focus:bg-white transition-all duration-300 text-base border border-gray-100/50"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowHistory(true)}
                    className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md relative"
                >
                    <History size={20} />
                    {promptHistory.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                            {promptHistory.length}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setShowSQLDialog(true)}
                    className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                >
                    <Database size={20} />
                </button>

                <button
                    type="button"
                    onClick={() => onSubmit()}
                    disabled={!value.trim()}
                    className="p-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
