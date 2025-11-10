"use client";
import React, { createContext, useContext, useState } from "react";

type Section = "connections" | "new" | "history" | "settings" | null;

interface SidebarContextType {
    selectedSection: Section;
    setSelectedSection: (section: Section) => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    selectedSection: null,
    setSelectedSection: () => { },
    isSidebarOpen: true,
    toggleSidebar: () => { },
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedSection, setSelectedSection] = useState<Section>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <SidebarContext.Provider
            value={{
                selectedSection,
                setSelectedSection,
                isSidebarOpen,
                toggleSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
