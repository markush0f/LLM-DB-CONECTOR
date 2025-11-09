"use client";
import React, { useState } from "react";
import { Trash2, ChevronDown, ChevronRight, Database } from "lucide-react";
import { useConnections } from "@/app/context/ConnectionsContext";
import { useSchemas } from "@/app/context/SchemaContext";
import { activateConnection } from "@/app/services/ConnectionService";
import SchemaDropdown from "./SchemaDropdown";
import ConnectionPasswordModal from "./ConnectionPasswordModal";

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
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleSelectConnection = () => {
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async (password: string) => {
        try {
            await activateConnection(conn.id, password);
            setActiveConnection(conn);
            setExpanded(true);
            setShowPasswordModal(false);
            console.log(`✅ Conexión ${conn.name} activada`);
        } catch (err: any) {
            console.error("❌ Error al activar conexión:", err);
            alert(`Error: ${err.message || err}`);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`¿Estás seguro de eliminar la conexión "${conn.name}"?`)) {
            removeConnection(conn.id);
        }
    };

    return (
        <>
            <li
                className={`group relative rounded-lg border transition-all duration-200 ${isActive
                    ? "bg-linear-to-r from-orange-50 to-orange-100 border-orange-300 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
            >
                <button
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={handleSelectConnection}
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
                            onClick={handleDelete}
                            className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Eliminar conexión"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </button>

                {/* Schemas expandibles */}
                {expanded && isActive && (
                    <div className="border-t border-orange-200 bg-orange-50/50 px-4 py-2">
                        <SchemaDropdown schemas={schemasList} onTableSelect={setSelectedSchema} />
                    </div>
                )}

                {/* Indicador de conexión activa */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full" />
                )}
            </li>

            {/* Modal de contraseña */}
            {showPasswordModal && (
                <ConnectionPasswordModal
                    connectionName={conn.name}
                    onSubmit={handlePasswordSubmit}
                    onCancel={() => setShowPasswordModal(false)}
                />
            )}
        </>
    );
}