"use client";
import React, { useEffect, useState } from "react";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useConnections } from "@/app/context/ConnectionsContext";
import { useSchemas } from "@/app/context/SchemaContext";
import { activateConnection } from "@/app/services/ConnectionService";
import SchemaDropdown from "./SchemaDropdown";

export default function ConnectionItem({
    conn,
    isActive,
    isOpen,
}: {
    conn: any;
    isActive: boolean;
    isOpen: boolean;
}) {
    const { setActiveConnection, removeConnection } = useConnections();
    const { schemasList, setSelectedSchema } = useSchemas();
    const [expanded, setExpanded] = useState(false);

    const handleSelectConnection = async () => {
        try {
            await activateConnection(conn.id);
            setActiveConnection(conn);
            setExpanded(true);
        } catch (err: any) {
            console.error("❌ Error al activar conexión:", err);
            alert(`Error: ${err.message || err}`);
        }
    };

    return (
        <li
            className={`group flex flex-col rounded-lg border transition-all cursor-pointer
        ${isActive ? "bg-orange-100 border-orange-300 text-orange-700"
                    : "bg-white border-gray-100 text-gray-700 hover:bg-gray-100"}`}
        >
            <div
                className="flex items-center justify-between px-3 py-2"
                onClick={handleSelectConnection}
            >
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="truncate text-sm">{conn.name}</span>
                </div>

                {isOpen && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeConnection(conn.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {expanded && isActive && <SchemaDropdown schemas={schemasList} onSelect={setSelectedSchema} />}
        </li>
    );
}
