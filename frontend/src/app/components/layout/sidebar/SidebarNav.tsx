"use client";
import React from "react";
import SidebarButton from "./SidebarButton";
import { Plus, Database, History, Settings } from "lucide-react";
import { Section } from "@/app/types/sectionType";

interface SidebarNavProps {
    isSidebarOpen: boolean;
    selectedSection: Section;
    setSelectedSection: (section: Section) => void;
    openNewConnection: () => void;
}

export default function SidebarNav({
    isSidebarOpen,
    selectedSection,
    setSelectedSection,
    openNewConnection,
}: SidebarNavProps) {
    const navItems = [
        {
            icon: <Plus size={18} />,
            text: "Nueva conexión",
            section: "new" as Section,
            onClick: openNewConnection,
        },
        {
            icon: <Database size={18} />,
            text: "Conexiones",
            section: "connections" as Section,
            onClick: () => setSelectedSection("connections"),
        },
        {
            icon: <History size={18} />,
            text: "Historial",
            section: "history" as Section,
            onClick: () => setSelectedSection("history"),
        },
        {
            icon: <Settings size={18} />,
            text: "Configuración",
            section: "settings" as Section,
            onClick: () => setSelectedSection("settings"),
        },
    ];

    return (
        <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
                <SidebarButton
                    key={item.section}
                    icon={item.icon}
                    text={item.text}
                    open={isSidebarOpen}
                    isActive={selectedSection === item.section}
                    onClick={item.onClick}
                />
            ))}
        </nav>
    );
}
