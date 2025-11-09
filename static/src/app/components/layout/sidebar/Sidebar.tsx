"use client";
import React, { useState } from "react";
import { Menu, X, Database, History, Settings } from "lucide-react";
import { useConnections } from "@/app/context/ConnectionsContext";
import SidebarButton from "./SidebarButton";
import ConnectionList from "./ConnectionList";
import ConnectionPasswordModal from "./ConnectionPasswordModal";
import { activateConnection } from "@/app/services/ConnectionService";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const { loading, error, setActiveConnection } = useConnections();

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);

    const handleSelectConnection = (conn: any) => {
        setSelectedConnection(conn);
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async (password: string) => {
        if (!selectedConnection) return;
        try {
            await activateConnection(selectedConnection.id, password);
            setActiveConnection(selectedConnection);
            setShowPasswordModal(false);
            console.log("✅ Conexión activada:", selectedConnection.name);
        } catch (err: any) {
            alert(`Error al activar la conexión: ${err.message || err}`);
        }
    };

    return (
        <>
            <aside
                className={`${isOpen ? "w-64" : "w-16"} 
          h-screen bg-gray-50 border-r border-gray-100 
          transition-all duration-300 flex flex-col justify-between overflow-hidden`}
            >
                <div className="p-3 flex flex-col gap-6">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-100 transition-all"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <nav className="flex flex-col gap-2 mt-4">
                        <SidebarButton icon={<Database size={20} />} text="Nueva conexión" open={isOpen} />
                        <SidebarButton icon={<History size={20} />} text="Historial" open={isOpen} />
                        <SidebarButton icon={<Settings size={20} />} text="Configuración" open={isOpen} />
                    </nav>

                    <div className="mt-6">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                            {isOpen ? "Conexiones" : ""}
                        </h3>
                        {loading && <p className="text-gray-400 text-xs">Cargando...</p>}
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <ConnectionList isOpen={isOpen} onSelect={handleSelectConnection} />
                    </div>
                </div>

                <div className="p-4 text-xs text-gray-400">
                    {isOpen ? "v0.1 – local mode" : "v0.1"}
                </div>
            </aside>

            {showPasswordModal && selectedConnection && (
                <ConnectionPasswordModal
                    connectionName={selectedConnection.name}
                    onSubmit={handlePasswordSubmit}
                    onCancel={() => setShowPasswordModal(false)}
                />
            )}
        </>
    );
}
