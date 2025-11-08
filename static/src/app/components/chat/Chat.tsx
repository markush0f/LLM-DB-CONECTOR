"use client";
import Input from "./Input";
import DatabaseDiagram from "../diagram/DatabaseDiagram";
import Image from "next/image";
import { useSchemas } from "@/app/context/SchemaContext";

export default function Chat() {
    const { loading, error } = useSchemas();

    // 🔸 Pantalla de carga centrada
    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={100}
                    height={100}
                    className="mb-4 opacity-90 hover:opacity-100 transition-opacity duration-200"
                />
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-sm font-medium">
                    Cargando esquema...
                </p>
            </div>
        );

    // 🔸 Error visualizado en toda la pantalla
    if (error)
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <p className="text-red-600 text-lg font-semibold">{error}</p>
            </div>
        );

    // 🔸 Vista normal del chat
    return (
        <div className="relative flex flex-col h-full bg-white">
            <div className="absolute top-1 right-4 z-30">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={80}
                    height={80}
                    className="opacity-90 hover:opacity-100 transition-opacity duration-200"
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <DatabaseDiagram />
            </div>

            <div className="border-t border-gray-100">
                <Input />
            </div>
        </div>
    );
}
