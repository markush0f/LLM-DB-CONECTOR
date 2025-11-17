"use client";
import React, { useState } from "react";
import { useConnections } from "@/app/context/ConnectionsContext";
import { useSchemas } from "@/app/context/SchemaContext";
import { activateConnection } from "@/app/services/ConnectionService";
import ConnectionHeader from "./ConnectionHeader";
import ConnectionSchemas from "./ConnectionSchemas";
import ConnectionActiveIndicator from "./ConnectionActiveIndicator";
import ConnectionPasswordModal from "./ConnectionPasswordModal";


interface ConnectionItemProps {
    conn: any;
    isActive: boolean;
    isOpen: boolean;
}

export default function ConnectionItem({ conn, isActive, isOpen }: ConnectionItemProps) {
    const { setActiveConnection, removeConnection } = useConnections();
    const { schemasList, setSelectedSchema } = useSchemas();
    const [expanded, setExpanded] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleSelectConnection = () => setShowPasswordModal(true);

    const handlePasswordSubmit = async (password: string) => {
        try {
            await activateConnection(conn.id, password);
            setActiveConnection(conn);
            setExpanded(true);
            setShowPasswordModal(false);
        } catch (err: any) {
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
                    ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
            >
                <ConnectionHeader
                    conn={conn}
                    isActive={isActive}
                    expanded={expanded}
                    isOpen={isOpen}
                    onClick={handleSelectConnection}
                    onDelete={handleDelete}
                />

                {expanded && isActive && (
                    <ConnectionSchemas
                        schemas={schemasList}
                        onSchemaSelect={setSelectedSchema}
                    />
                )}

                {isActive && <ConnectionActiveIndicator />}
            </li>

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
