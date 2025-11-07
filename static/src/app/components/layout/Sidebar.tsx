"use client";
import React, { useState } from "react";
import { Menu, X, Database, History, Settings, Trash2 } from "lucide-react";
import { useConnections } from "@/app/context/ConnectionsContext";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const { connections, loading, error, removeConnection } = useConnections();

    return (
        <aside
            className={`${isOpen ? "w-64" : "w-16"}
        h-screen bg-gray-50 border-r border-gray-100 transition-all duration-300
        flex flex-col justify-between overflow-hidden`}
        >
            <div className="p-3 flex flex-col gap-6">
                {/* Botón toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-100 transition-all"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Menú superior */}
                <nav className="flex flex-col gap-2 mt-4">
                    <SidebarButton icon={<Database size={20} />} text="Nueva conexión" open={isOpen} />
                    <SidebarButton icon={<History size={20} />} text="Historial" open={isOpen} />
                    <SidebarButton icon={<Settings size={20} />} text="Configuración" open={isOpen} />
                </nav>

                {/* Lista de conexiones */}
                <div className="mt-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                        {isOpen ? "Conexiones" : ""}
                    </h3>

                    {loading && <p className="text-gray-400 text-xs">Cargando...</p>}
                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <ul className="space-y-1">
                        {connections.map((conn) => (
                            <li
                                key={conn.id}
                                className="group flex items-center justify-between bg-white border border-gray-100 rounded-lg px-2 py-2 hover:bg-gray-100"
                            >
                                <span className="truncate text-sm text-gray-700">
                                    {isOpen ? conn.name : conn.name.slice(0, 2).toUpperCase()}
                                </span>
                                {isOpen && (
                                    <button
                                        onClick={() => removeConnection(conn.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="p-4 text-xs text-gray-400">{isOpen ? "v0.1 – local mode" : "v0.1"}</div>
        </aside>
    );
}

/* 🔸 Botón individual */
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
                className={`flex items-center ${open ? "justify-start px-3" : "justify-center"}
          gap-3 w-full py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200`}
            >
                <div className="flex-shrink-0">{icon}</div>
                {open && <span className="truncate">{text}</span>}
            </button>
            {!open && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-lg">
                    {text}
                </div>
            )}
        </div>
    );
}
