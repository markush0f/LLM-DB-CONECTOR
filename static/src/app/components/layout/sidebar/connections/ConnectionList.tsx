"use client";
import React from "react";
import { useConnections } from "@/app/context/ConnectionsContext";
import ConnectionItem from "./ConnectionItem";

interface Props {
    isOpen: boolean;
    onSelect: (conn: any) => void;
}

export default function ConnectionList({ isOpen, onSelect }: Props) {
    const { connections, activeConnection } = useConnections();

    if (!connections.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No hay conexiones</p>
                <p className="text-xs text-gray-500 text-center">
                    Agrega una nueva conexión para comenzar
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2 py-2">
            {connections.map((conn) => (
                <ConnectionItem
                    key={conn.id}
                    conn={conn}
                    isActive={activeConnection?.id === conn.id}
                    isOpen={isOpen}
                    onSelect={() => onSelect(conn)}
                />
            ))}
        </div>
    );
}