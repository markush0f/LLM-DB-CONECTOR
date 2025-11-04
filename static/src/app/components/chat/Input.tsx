"use client";
import React, { useState } from 'react';
import { Send, History, X } from 'lucide-react';

export default function Input() {
    const [value, setValue] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [promptHistory, setPromptHistory] = useState<string[]>([
        "Crear diagrama de base de datos para e-commerce",
        "Agregar tabla de categorías",
        "Mostrar relaciones entre usuarios y pedidos",
        "Cambiar colores a naranja"
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            console.log('Enviado:', value);
            setPromptHistory(prev => [value, ...prev]);
            setValue('');
        }
    };

    const handleHistoryClick = (prompt: string) => {
        setValue(prompt);
        setShowHistory(false);
    };

    const clearHistory = () => {
        setPromptHistory([]);
    };

    return (
        <div className="relative w-full border-t border-gray-100 bg-slate-50 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto relative">
                <div className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Escribe tu mensaje..."
                        className="w-full px-6 py-4 pr-28 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 rounded-2xl shadow-lg shadow-gray-200/50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:shadow-xl focus:bg-white transition-all duration-300 text-base border border-gray-100/50"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
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
                            onClick={handleSubmit}
                            disabled={!value.trim()}
                            className="p-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>

                {/* Panel de historial */}
                {/* Panel de historial */}
                {showHistory && (
                    <>
                        {/* Overlay para cerrar al hacer click fuera */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowHistory(false)}
                        />

                        {/* Panel que ahora se abre hacia arriba */}
                        <div className="absolute right-0 bottom-full mb-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-hidden flex flex-col animate-slide-up">
                            {/* Header */}
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

                            {/* Lista */}
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
                )}

            </div>
        </div>
    );
}