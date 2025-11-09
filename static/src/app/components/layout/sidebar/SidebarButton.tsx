"use client";
import React from "react";

interface SidebarButtonProps {
    icon: React.ReactNode;
    text: string;
    open: boolean;
    isActive?: boolean;
    onClick?: () => void;
}

export default function SidebarButton({ icon, text, open, isActive = false, onClick }: SidebarButtonProps) {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`flex items-center ${open ? "justify-start px-3" : "justify-center"
                    } gap-3 w-full py-2 rounded-lg transition-all duration-200 ${isActive
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
            >
                {/* Indicador lateral para opción activa */}
                {isActive && open && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-700 rounded-r-full" />
                )}

                <div
                    className={`flex-shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                >
                    {icon}
                </div>

                {open && (
                    <span className={`truncate ${isActive ? "font-semibold" : ""}`}>
                        {text}
                    </span>
                )}

                {isActive && !open && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-600 rounded-l-full" />
                )}
            </button>

            {!open && (
                <div
                    className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-lg ${isActive ? "bg-orange-600 text-white" : "bg-gray-800 text-white"
                        }`}
                >
                    {text}
                </div>
            )}
        </div>
    );
}