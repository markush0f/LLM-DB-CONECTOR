"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import TableColumn from "./TableColumn";

/**
 * TableColumnList compares current vs previous schema
 * to highlight new or removed columns.
 */
export default function TableColumnList({
    tableName,
    columns,
    prevSchema,
}: {
    tableName: string;
    columns: any[];
    prevSchema?: any;
}) {
    const [newCols, setNewCols] = useState<string[]>([]);
    const [removedCols, setRemovedCols] = useState<string[]>([]);

    useEffect(() => {
        if (!prevSchema) return;

        const tableKey = Object.keys(prevSchema).find((key) =>
            key.endsWith(`.${tableName}`)
        );
        const prevCols = tableKey
            ? prevSchema[tableKey]?.columns.map((c: any) => c.name)
            : [];
        const currentCols = columns.map((c) => c.name);

        const added = currentCols.filter((c) => !prevCols.includes(c));
        const deleted = prevCols.filter((c) => !currentCols.includes(c));

        setNewCols(added);
        setRemovedCols(deleted);

        const timer = setTimeout(() => setNewCols([]), 1500);
        return () => clearTimeout(timer);
    }, [columns, prevSchema, tableName]);

    return (
        <div className="divide-y divide-slate-100">
            <AnimatePresence>
                {columns.map((col, i) => (
                    <TableColumn
                        key={col.name}
                        col={col}
                        isNew={newCols.includes(col.name)}
                        isRemoved={removedCols.includes(col.name)}
                        tableName={tableName}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
