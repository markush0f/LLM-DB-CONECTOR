"use client";
import React from "react";
import { Layers, ChevronRight } from "lucide-react";
import TableDropdown from "./TableDropdown";
import { useSchemas } from "@/app/context/SchemaContext";

export default function SchemaDropdown({
    schemas,
    onTableSelect,
}: {
    schemas: string[];
    onTableSelect?: (table: string) => void;
}) {
    const {
        selectedSchema,
        setSelectedSchema,
        tables,
        isLoadingTables,
    } = useSchemas();

    const handleSelectSchema = (schema: string) => {
        setSelectedSchema(schema);
    };

    const handleTableSelect = (table: string) => {
        if (onTableSelect) onTableSelect(table);
    };

    if (!schemas.length) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <Layers size={14} className="text-gray-400" />
                <span>No hay schemas disponibles</span>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-1.5">
                <Layers size={14} className="text-orange-600" />
                <span className="text-xs font-semibold text-orange-900 uppercase tracking-wide">
                    Schemas
                </span>
                <span className="text-xs text-orange-600 bg-orange-200 px-1.5 py-0.5 rounded-full font-medium">
                    {schemas.length}
                </span>
            </div>

            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                <ul className="space-y-0.5 px-2">
                    {schemas.map((s) => (
                        <button
                            key={s}
                            onClick={() => handleSelectSchema(s)}
                            className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all cursor-pointer ${selectedSchema === s
                                ? "bg-orange-200 text-orange-900 font-medium shadow-sm"
                                : "text-gray-700 hover:bg-orange-100 hover:text-orange-800"
                                }`}
                        >
                            <span className="truncate">{s}</span>
                            <ChevronRight
                                size={14}
                                className={`flex-shrink-0 transition-transform ${selectedSchema === s
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                                    }`}
                            />
                        </button>
                    ))}
                </ul>
            </div>

            {/* Tablas del schema seleccionado */}
            {selectedSchema && (
                <div className="pt-3 border-t border-orange-200">
                    <TableDropdown
                        tables={tables}
                        onSelect={handleTableSelect}
                        isLoading={isLoadingTables}
                    />
                </div>
            )}
        </div>
    );
}
