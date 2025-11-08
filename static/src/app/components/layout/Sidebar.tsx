"use client";
import React, { useState } from "react";
import { Menu, X, Database, History, Settings, Trash2 } from "lucide-react";
import { useConnections } from "@/app/context/ConnectionsContext";
import { activateConnection } from "@/app/services/ConnectionService";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const {
        connections,
        loading,
        error,
        activeConnection,
        setActiveConnection,
        removeConnection,
    } = useConnections();

    // 🔹 Activar una conexión (backend + frontend)
    const handleSelectConnection = async (conn: any) => {
        try {
            console.log("🎯 [Sidebar] Activando conexión:", conn.name);
            await activateConnection(conn.id);
            setActiveConnection(conn);
            console.log("✅ [Sidebar] Conexión activada:", conn.name);
        } catch (err: any) {
            console.error("❌ [Sidebar] Error al activar conexión:", err);
            alert(`Error al activar la conexión: ${err.message || err}`);
        }
    };

    return (
        <aside
            className={`${isOpen ? "w-64" : "w-16"} 
        h-screen bg-gray-50 border-r border-gray-100 
        transition-all duration-300 flex flex-col justify-between overflow-hidden`}
        >
            {/* 🔸 Parte superior */}
            <div className="p-3 flex flex-col gap-6">
                {/* Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-100 transition-all"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Menú de navegación */}
                <nav className="flex flex-col gap-2 mt-4">
                    <SidebarButton icon={<Database size={20} />} text="Nueva conexión" open={isOpen} />
                    <SidebarButton icon={<History size={20} />} text="Historial" open={isOpen} />
                    <SidebarButton icon={<Settings size={20} />} text="Configuración" open={isOpen} />
                </nav>

                {/* 🔹 Lista de conexiones */}
                <div className="mt-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                        {isOpen ? "Conexiones" : ""}
                    </h3>

                    {loading && <p className="text-gray-400 text-xs">Cargando...</p>}
                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <ul className="space-y-1">
                        {connections.map((conn) => {
                            const isActive = activeConnection?.id === conn.id;
                            return (
                                <li
                                    key={conn.id}
                                    onClick={() => handleSelectConnection(conn)}
                                    className={`group flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 border transition-all
                    ${isActive
                                            ? "bg-orange-100 border-orange-300 text-orange-700"
                                            : "bg-white border-gray-100 text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <span className="truncate text-sm">{conn.name}</span>

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
                                </li>
                            );
                        })}
                    </ul>

                    {!loading && !connections.length && (
                        <p className="text-gray-400 text-xs italic mt-2">
                            No hay conexiones guardadas
                        </p>
                    )}
                </div>
            </div>

            {/* 🔹 Footer */}
            <div className="p-4 text-xs text-gray-400">
                {isOpen ? "v0.1 – local mode" : "v0.1"}
            </div>
        </aside>
    );
}

/* 🔸 Botón reutilizable para el menú lateral */
function SidebarButton({
    icon,
    text,
    open,
}: {
    icon: React.ReactNode;
    text: string;
    open: boolean;
}) {
    return (
        <div className="relative group">
            <button
                className={`flex items-center ${open ? "justify-start px-3" : "justify-center"
                    } gap-3 w-full py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200`}
            >
                <div className="flex-shrink-0">{icon}</div>
                {open && <span className="truncate">{text}</span>}
            </button>

            {/* Tooltip — visible solo cuando está cerrado */}
            {!open && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-lg">
                    {text}
                </div>
            )}
        </div>
    );
}
