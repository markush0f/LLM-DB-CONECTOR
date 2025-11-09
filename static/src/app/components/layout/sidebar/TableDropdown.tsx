"use client";
import React, { useState } from "react";
import { Table, ChevronRight } from "lucide-react";

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
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-orange-300 border-t-orange-600" />
                <span>Cargando tablas...</span>
            </div>
        );
    }

    if (!tables.length) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <Table size={14} className="text-gray-400" />
                <span>No hay tablas disponibles</span>
            </div>
        );
    }

    return (
        <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2 px-3 py-1.5">
                <Table size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Tablas
                </span>
                <span className="text-xs text-blue-600 bg-blue-200 px-1.5 py-0.5 rounded-full font-medium">
                    {tables.length}
                </span>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <ul className="space-y-0.5 px-2">
                    {tables.map((table) => (
                        <button
                            key={table}
                            onClick={() => handleSelect(table)}
                            className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all cursor-pointer ${selectedTable === table
                                ? "bg-blue-200 text-blue-900 font-medium shadow-sm"
                                : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                                }`}
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div
                                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${selectedTable === table ? "bg-blue-600" : "bg-gray-400"
                                        }`}
                                />
                                <span className="truncate">{table}</span>
                            </div>
                            <ChevronRight
                                size={14}
                                className={`flex-shrink-0 transition-transform ${selectedTable === table
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                                    }`}
                            />
                        </button>
                    ))}
                </ul>
            </div>
        </div>
    );
}