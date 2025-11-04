"use client";
import Input from "./Input";
import DatabaseDiagram from "../diagram/DatabaseDiagram";
import Image from "next/image";

export default function Chat() {
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

            {/* Input fijo solo dentro del área del chat */}
            <div className="border-t border-gray-100">
                <Input />
            </div>
        </div>
    );
}
