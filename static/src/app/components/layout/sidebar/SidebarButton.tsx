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
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
            >
                {/* Indicador lateral sutil */}
                {isActive && open && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-r-full" />
                )}

                <div
                    className={`flex-shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-105"
                        }`}
                >
                    {icon}
                </div>

                {open && (
                    <span className={`truncate text-sm ${isActive ? "font-medium" : ""}`}>
                        {text}
                    </span>
                )}

                {/* Indicador cuando está cerrado */}
                {isActive && !open && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-l-full" />
                )}
            </button>

            {/* Tooltip cuando el sidebar está cerrado */}
            {!open && (
                <div
                    className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-lg ${isActive ? "bg-orange-600 text-white" : "bg-gray-800 text-white"
                        }`}
                >
                    {text}
                </div>
            )}
        </div>
    );
}