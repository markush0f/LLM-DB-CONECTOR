"use client";
import React, { useState } from "react";
import { Table, ChevronRight, Circle, CheckCircle2, Loader2 } from "lucide-react";

export default function TableDropdown({
    tables,
    onSelect,
    isLoading = false,
}: {
    tables: string[];
    onSelect: (table: string) => void;
    isLoading?: boolean;
}) {
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    const handleSelect = (table: string) => {
        setSelectedTable(table);
        onSelect(table);
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <Loader2 size={14} className="animate-spin text-gray-400" />
                <span>Cargando tablas del schema...</span>
            </div>
        );
    }

    if (!tables.length) {
        return (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <Table size={14} className="text-gray-400" />
                <span>No hay tablas en este schema</span>
            </div>
        );
    }

    return (
        <div className="space-y-2 mt-3">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                    <Table size={13} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Tablas
                    </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    {tables.length}
                </span>
            </div>

            {/* Lista de tablas */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <ul className="space-y-0.5">
                    {tables.map((table) => (
                        <li key={table}>
                            <button
                                onClick={() => handleSelect(table)}
                                className={`w-full group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${selectedTable === table
                                    ? "bg-gray-100 text-gray-900 border border-gray-200"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {selectedTable === table ? (
                                        <CheckCircle2 size={14} className="flex-shrink-0 text-gray-700" />
                                    ) : (
                                        <Circle size={14} className="flex-shrink-0 text-gray-400" />
                                    )}
                                    <span className="truncate">{table}</span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={`flex-shrink-0 text-gray-400 transition-all ${selectedTable === table
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                                        }`}
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}