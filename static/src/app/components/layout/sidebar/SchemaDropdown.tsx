"use client";
import React from "react";

export default function SchemaDropdown({
    schemas,
    onSelect,
}: {
    schemas: string[];
    onSelect: (schema: string) => void;
}) {
    if (!schemas.length) {
        return <p className="text-gray-400 text-xs px-4 py-1">No hay schemas</p>;
    }

    return (
        <ul className="pl-8 pb-2 space-y-1">
            {schemas.map((s) => (
                <li
                    key={s}
                    onClick={() => onSelect(s)}
                    className="text-sm text-gray-700 px-3 py-1 rounded hover:bg-gray-100 cursor-pointer"
                >
                    {s}
                </li>
            ))}
        </ul>
    );
}
