"use client";
import React from "react";

interface SidebarFooterProps {
    isSidebarOpen: boolean;
}

export default function SidebarFooter({ isSidebarOpen }: SidebarFooterProps) {
    return (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
                {isSidebarOpen ? "v0.1 – local mode" : "v0.1"}
            </p>
        </div>
    );
}
