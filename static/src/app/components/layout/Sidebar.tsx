"use client";
import React, { useState } from "react";
import { Menu, X, Database, History, Settings } from "lucide-react";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <aside
            className={`${isOpen ? "w-64" : "w-16"
                } h-screen bg-gray-50 border-r border-gray-100 transition-all duration-300 flex flex-col justify-between overflow-hidden`}
        >
            {/* Parte superior */}
            <div className="p-3 flex flex-col gap-6">
                {/* Botón toggle */}
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
            </div>

            {/* Footer */}
            <div className="p-4 text-xs text-gray-400">
                {isOpen ? "v0.1 – local mode" : "v0.1"}
            </div>
        </aside>
    );
}

/* 🔸 Componente individual del botón */
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
        <button
            className={`flex items-center ${open ? "justify-start px-3" : "justify-center"
                } gap-3 w-full py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200`}
        >
            <div className="flex-shrink-0">{icon}</div>
            {open && <span className="truncate">{text}</span>}
        </button>
    );
}
