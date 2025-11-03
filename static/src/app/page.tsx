"use client";
import React, { useState } from "react";
import Chat from "./components/chat/Chat";
import { Menu, X, Database, History, Settings } from "lucide-react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isOpen ? "w-64" : "w-0"
          } bg-gray-50 border-r border-gray-100 transition-all duration-300 overflow-hidden flex flex-col justify-between`}
      >
        <div className="p-4">
          <h1 className="text-lg font-semibold text-gray-800 mb-6">LLM-DB</h1>
          <nav className="space-y-2">
            <button className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all">
              <Database size={18} /> Nueva conexión
            </button>
            <button className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all">
              <History size={18} /> Historial
            </button>
            <button className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all">
              <Settings size={18} /> Configuración
            </button>
          </nav>
        </div>

        <div className="p-4 text-xs text-gray-400">
          v0.1 – local mode
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 relative flex flex-col h-full">
        {/* Botón para abrir/cerrar sidebar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 left-4 z-10 bg-white border border-gray-200 p-2 rounded-lg shadow-sm hover:bg-gray-100 transition-all"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Chat principal */}
        <Chat />
      </div>
    </div>
  );
}
