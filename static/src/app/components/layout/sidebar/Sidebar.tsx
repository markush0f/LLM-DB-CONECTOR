"use client";
import React, { useState } from "react";
import { Menu, X, Database, History, Settings, Plus } from "lucide-react";
import { useConnections } from "@/app/context/ConnectionsContext";
import SidebarButton from "./SidebarButton";
import ConnectionList from "./ConnectionList";
import ConnectionPasswordModal from "./ConnectionPasswordModal";
import { activateConnection } from "@/app/services/ConnectionService";
import { useSidebar } from "@/app/context/SidebarConnection";
import { ConnectionData } from "@/app/types/connectionData";
import NewConnectionModal from "../../connection/AddConnectionModal";


export default function Sidebar() {
    const { selectedSection, setSelectedSection, isSidebarOpen, toggleSidebar } = useSidebar();
    const { loading, error, setActiveConnection, addConnection, connections } = useConnections();

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
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
            setSelectedSection("connections");
            console.log("Conexión activada:", selectedConnection.name);
        } catch (err: any) {
            alert(`Error al activar la conexión: ${err.message || err}`);
        }
    };

    const handleCreateConnection = async (data: ConnectionData) => {
        try {

            const newConnection = {
                ...data,
                id: connections && connections.length > 0 ? connections[0].id + 1 : 1
            };

            addConnection(newConnection);
            setShowNewConnectionModal(false);
            setSelectedSection("connections");
            console.log("Nueva conexión creada:", data.name);
        } catch (err: any) {
            alert(`Error al crear conexión: ${err.message || err}`);
            throw err;
        }
    };

    return (
        <>
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-16"} 
          h-screen bg-gray-50 border-r border-gray-100 
          transition-all duration-300 flex flex-col justify-between overflow-hidden`}
            >
                <div className="p-3 flex flex-col gap-6">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-100 transition-all"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <nav className="flex flex-col gap-2 mt-4">
                        <SidebarButton
                            icon={<Plus size={20} />}
                            text="Nueva conexión"
                            open={isSidebarOpen}
                            isActive={selectedSection === "new"}
                            onClick={() => {
                                setSelectedSection("new");
                                setShowNewConnectionModal(true);
                            }}
                        />
                        <SidebarButton
                            icon={<Database size={20} />}
                            text="Conexiones"
                            open={isSidebarOpen}
                            isActive={selectedSection === "connections"}
                            onClick={() => setSelectedSection("connections")}
                        />
                        <SidebarButton
                            icon={<History size={20} />}
                            text="Historial"
                            open={isSidebarOpen}
                            isActive={selectedSection === "history"}
                            onClick={() => setSelectedSection("history")}
                        />
                        <SidebarButton
                            icon={<Settings size={20} />}
                            text="Configuración"
                            open={isSidebarOpen}
                            isActive={selectedSection === "settings"}
                            onClick={() => setSelectedSection("settings")}
                        />
                    </nav>

                    {selectedSection === "connections" && (
                        <div className="mt-6">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                                {isSidebarOpen ? "Mis Conexiones" : ""}
                            </h3>
                            {loading && <p className="text-gray-400 text-xs">Cargando...</p>}
                            {error && <p className="text-red-500 text-xs">{error}</p>}
                            {isSidebarOpen ? (
                                <ConnectionList isOpen={isSidebarOpen} onSelect={handleSelectConnection} />
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {/* Iconos pequeños cuando está cerrado */}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 text-xs text-gray-400">
                    {isSidebarOpen ? "v0.1 – local mode" : "v0.1"}
                </div>
            </aside>

            {showPasswordModal && selectedConnection && (
                <ConnectionPasswordModal
                    connectionName={selectedConnection.name}
                    onSubmit={handlePasswordSubmit}
                    onCancel={() => setShowPasswordModal(false)}
                />
            )}

            {showNewConnectionModal && (
                <NewConnectionModal
                    isOpen={showNewConnectionModal}
                    onClose={() => {
                        setShowNewConnectionModal(false);
                        setSelectedSection(null);
                    }}
                    onSubmit={handleCreateConnection}
                />
            )}
        </>
    );
}