"use client";
import React from "react";

export default function SidebarButton({
    icon,
    text,
    open,
}: {
    icon: React.ReactNode;
    text: string;
    open: boolean;
}) {
    return (
        <div className="relative group">
            <button
                className={`flex items-center ${open ? "justify-start px-3" : "justify-center"
                    } gap-3 w-full py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200`}
            >
                <div className="flex-shrink-0">{icon}</div>
                {open && <span className="truncate">{text}</span>}
            </button>

            {!open && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 shadow-lg">
                    {text}
                </div>
            )}
        </div>
    );
}
