"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useConnections } from "@/app/context/ConnectionsContext";
import { useSidebar } from "@/app/context/SidebarConnection";
import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";
import ConnectionList from "./ConnectionList";
import ConnectionPasswordModal from "./ConnectionPasswordModal";
import NewConnectionModal from "../../connection/AddConnectionModal";
import { activateConnection } from "@/app/services/ConnectionService";
import { ConnectionData } from "@/app/types/connectionData";

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
        } catch (err: any) {
            alert(`Error activating connection: ${err.message || err}`);
        }
    };

    const handleCreateConnection = async (data: ConnectionData) => {
        try {
            await addConnection(data);
            setShowNewConnectionModal(false);
            setSelectedSection("connections");
        } catch (err: any) {
            alert(`Error creating connection: ${err.message || err}`);
            throw err;
        }
    };

    return (
        <>
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-16"} 
        h-screen bg-white border-r border-gray-200 
        transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm`}
            >
                <div className="p-3 flex flex-col gap-6">
                    <SidebarHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <SidebarNav
                        isSidebarOpen={isSidebarOpen}
                        selectedSection={selectedSection}
                        setSelectedSection={setSelectedSection}
                        openNewConnection={() => {
                            setSelectedSection("new");
                            setShowNewConnectionModal(true);
                        }}
                    />

                    {selectedSection === "connections" && (
                        <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                            {isSidebarOpen && (
                                <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-200">
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mis Conexiones
                                    </h3>
                                    {connections && connections.length > 0 && (
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {connections.length}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto mt-2">
                                {loading ? (
                                    <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-500">
                                        <Loader2 size={14} className="animate-spin text-gray-400" />
                                        <span>Loading connections...</span>
                                    </div>
                                ) : error ? (
                                    <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded-md border border-red-200">
                                        {error}
                                    </div>
                                ) : isSidebarOpen ? (
                                    <ConnectionList isOpen={isSidebarOpen} onSelect={handleSelectConnection} />
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>

                <SidebarFooter isSidebarOpen={isSidebarOpen} />
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
