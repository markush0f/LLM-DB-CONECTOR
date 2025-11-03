"use client";
import React from "react";
import Input from "./Input";
import DatabaseDiagram from "../diagram/DatabaseDiagram";

export default function Chat() {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Contenedor del diagrama (ocupa todo menos el input) */}
            <div className="flex-1">
                <DatabaseDiagram />
            </div>

            {/* Input fijo solo dentro del área del chat */}
            <div className="border-t border-gray-100">
                <Input />
            </div>
        </div>
    );
}
