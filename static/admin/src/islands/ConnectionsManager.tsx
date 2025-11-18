import { useState, useEffect } from "react";

import {
    listConnections,
    saveConnection,
    deleteConnection,
    useConnection
} from "../lib/api/connections";

import ConnectionItem from "../components/connections/ConnectionItem";
import ConnectionFormModal from "../components/connections/ConnectionsFormModal";
import type { SavedConnection, PGDBConnector } from "../types/DBConnection.types";


interface Props {
    initialConnections: SavedConnection[];
}

export default function ConnectionsManager({ initialConnections }: Props) {

    const [connections, setConnections] = useState<SavedConnection[]>(initialConnections);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConnection, setEditingConnection] = useState<SavedConnection | null>(null);

    // Fetch updated list from backend
    async function loadConnections() {
        try {
            const data = await listConnections();
            setConnections(data.connections);
        } catch (err) {
            console.error("Error loading connections:", err);
        }
    }

    useEffect(() => {
        // Load fresh data from backend
        loadConnections();

        const handleAddClick = () => {
            setEditingConnection(null);
            setIsModalOpen(true);
        };

        const addButton = document.getElementById("add-connection-btn");
        addButton?.addEventListener("click", handleAddClick);

        return () => {
            addButton?.removeEventListener("click", handleAddClick);
        };
    }, []);


    const handleEdit = (id: number) => {
        const item = connections.find(c => c.id === id);
        if (item) {
            setEditingConnection(item);
            setIsModalOpen(true);
        }
    };


    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this connection?")) return;

        try {
            await deleteConnection(id);
            setConnections(connections.filter(c => c.id !== id));
        } catch (err) {
            alert("Error deleting connection.");
            console.error(err);
        }
    };


    const handleTest = async (id: number) => {
        const password = prompt("Enter password to activate/test this connection:");
        if (!password) return;

        try {
            const result = await useConnection(id, password);

            alert(`Connection successful!\n\n${result.message}`);

            // Update UI reflecting active connection
            await loadConnections();

        } catch (err) {
            alert("Connection failed.");
            console.error(err);
        }
    };


    const handleSave = async (formData: PGDBConnector) => {
        try {
            await saveConnection(formData);
            await loadConnections();
            setIsModalOpen(false);
            setEditingConnection(null);
        } catch (err) {
            alert("Error saving connection.");
            console.error(err);
        }
    };


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {connections.map(connection => (
                    <ConnectionItem
                        key={connection.id}
                        connection={connection}
                        onEdit={() => handleEdit(connection.id)}
                        onDelete={() => handleDelete(connection.id)}
                        onTest={() => handleTest(connection.id)}
                    />
                ))}
            </div>

            {connections.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7
                                 M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4
                                 M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first database connection</p>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Connection
                    </button>
                </div>
            )}

            <ConnectionFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingConnection(null);
                }}
                onSave={handleSave}
                editConnection={editingConnection}
            />
        </>
    );
}
