"use client";
import React from "react";
import { useConnections } from "@/app/context/ConnectionsContext";
import ConnectionItem from "./ConnectionItem";

export default function ConnectionList({ isOpen }: { isOpen: boolean }) {
    const { connections, activeConnection } = useConnections();

    if (!connections.length)
        return <p className="text-gray-400 text-xs italic mt-2">No hay conexiones guardadas</p>;

    return (
        <ul className="space-y-1">
            {connections.map((conn) => (
                <ConnectionItem
                    key={conn.id}
                    conn={conn}
                    isActive={activeConnection?.id === conn.id}
                    isOpen={isOpen}
                />
            ))}
        </ul>
    );
}
