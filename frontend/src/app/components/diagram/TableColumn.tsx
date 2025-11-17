"use client";
import React from "react";
import { motion } from "framer-motion";
import { Handle, Position } from "@xyflow/react";

/**
 * TableColumn renders a single column with entry/exit animations
 * and visual indicators for PK / FK.
 */
export default function TableColumn({
    col,
    isNew,
    isRemoved,
    tableName,
}: {
    col: any;
    isNew?: boolean;
    isRemoved?: boolean;
    tableName: string;
}) {
    if (isRemoved) {
        return (
            <motion.div
                key={`removed-${col.name}`}
                layout
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between px-4 py-2.5 relative bg-red-50/70 border-l-2 border-red-300 text-slate-400 line-through"
            >
                <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-5 h-5" />
                    <span className="font-medium text-xs">{col.name}</span>
                </div>
                <span className="text-xs font-mono bg-slate-50 px-2 py-0.5 rounded">
                    {col.type}
                </span>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center justify-between px-4 py-2.5 relative transition-all duration-300 ${isNew
                    ? "bg-orange-50/70 shadow-inner border-l-2 border-orange-400"
                    : "hover:bg-orange-50/40"
                }`}
        >
            <div className="flex items-center gap-2.5 flex-1">
                {col.isPK && (
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-500 shadow-sm">
                        <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}

                {col.isFK && !col.isPK && (
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-orange-500 shadow-sm">
                        <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}

                {!col.isPK && !col.isFK && <div className="w-5 h-5" />}

                <span className="font-medium text-slate-700 text-xs">{col.name}</span>
            </div>

            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">
                {col.type}
            </span>

            <Handle
                type="target"
                position={Position.Left}
                id={`${tableName}-${col.name}-target`}
                className="opacity-0 pointer-events-none"
            />
            <Handle
                type="source"
                position={Position.Right}
                id={`${tableName}-${col.name}-source`}
                className="opacity-0 pointer-events-none"
            />
        </motion.div>
    );
}
