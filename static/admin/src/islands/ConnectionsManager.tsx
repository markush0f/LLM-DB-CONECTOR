import { useState, useEffect } from "react";
import ConnectionItem from "../components/connections/ConnectionItem";
import ConnectionFormModal from "../components/connections/ConnectionsFormModal";
import type { DBConnection, DBConnectionForm } from "../types/DBConnection.types";

interface Props {
    initialConnections: DBConnection[];
}

export default function ConnectionsManager({ initialConnections }: Props) {
    const [connections, setConnections] = useState<DBConnection[]>(initialConnections);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConnection, setEditingConnection] = useState<DBConnection | null>(null);

    useEffect(() => {
        // Escuchar evento del botón "New Connection"
        const handleAddClick = () => {
            setEditingConnection(null);
            setIsModalOpen(true);
        };

        const addButton = document.getElementById('add-connection-btn');
        addButton?.addEventListener('click', handleAddClick);

        return () => {
            addButton?.removeEventListener('click', handleAddClick);
        };
    }, []);

    const handleEdit = (id: string) => {
        const connection = connections.find(c => c.id === id);
        if (connection) {
            setEditingConnection(connection);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this connection?')) {
            setConnections(connections.filter(c => c.id !== id));
            // Aquí iría la llamada a la API para eliminar
            console.log('Deleting connection:', id);
        }
    };

    const handleTest = async (id: string) => {
        const connection = connections.find(c => c.id === id);
        if (connection) {
            // Simular test de conexión
            alert(`Testing connection to ${connection.name}...\n\nConnection successful!`);
            console.log('Testing connection:', id);
        }
    };

    const handleSave = (formData: DBConnectionForm) => {
        if (editingConnection) {
            // Actualizar conexión existente
            setConnections(connections.map(c =>
                c.id === editingConnection.id
                    ? { ...c, ...formData, lastConnected: new Date().toISOString() }
                    : c
            ));
            console.log('Updating connection:', editingConnection.id, formData);
        } else {
            // Crear nueva conexión
            const newConnection: DBConnection = {
                ...formData,
                id: Date.now().toString(),
                status: 'disconnected',
                createdAt: new Date().toISOString()
            };
            setConnections([...connections, newConnection]);
            console.log('Creating connection:', formData);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {connections.map((connection) => (
                    <ConnectionItem
                        key={connection.id}
                        connection={connection}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTest={handleTest}
                    />
                ))}
            </div>

            {connections.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
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