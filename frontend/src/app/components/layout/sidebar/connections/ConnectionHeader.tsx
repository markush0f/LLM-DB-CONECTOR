"use client";
import React from "react";
import { Trash2, ChevronDown, Database } from "lucide-react";

interface ConnectionHeaderProps {
    conn: any;
    isActive: boolean;
    expanded: boolean;
    isOpen: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

export default function ConnectionHeader({
    conn,
    isActive,
    expanded,
    isOpen,
    onClick,
    onDelete,
}: ConnectionHeaderProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            className="flex items-center justify-between px-4 py-3 cursor-pointer w-full"
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"
                        }`}
                >
                    <ChevronDown
                        size={18}
                        className={isActive ? "text-orange-600" : "text-gray-400"}
                    />
                </div>

                <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-orange-200" : "bg-gray-100"
                        }`}
                >
                    <Database
                        size={16}
                        className={isActive ? "text-orange-700" : "text-gray-600"}
                    />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                    <span
                        className={`text-sm font-medium truncate ${isActive ? "text-orange-900" : "text-gray-900"
                            }`}
                    >
                        {conn.name}
                    </span>
                    {conn.host && (
                        <span className="text-xs text-gray-500 truncate">
                            {conn.host}:{conn.port || "5432"}
                        </span>
                    )}
                </div>
            </div>

            {isOpen && (
                <button
                    onClick={onDelete}
                    className="shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Eliminar conexión"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>

    );
}
