"use client";
import React from "react";
import { Menu, X } from "lucide-react";

interface SidebarHeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function SidebarHeader({ isSidebarOpen, toggleSidebar }: SidebarHeaderProps) {
    return (
        <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all"
        >
            {isSidebarOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
        </button>
    );
}
