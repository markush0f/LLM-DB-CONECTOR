"use client";
import React from "react";

/**
 * TableHeader component renders the top bar of the table node.
 */
export default function TableHeader({ name }: { name: string }) {
    return (
        <div className="drag-handle relative bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 cursor-grab active:cursor-grabbing group">
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2.5">
                <div className="p-1.5 bg-white/15 rounded backdrop-blur-sm">
                    <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                    </svg>
                </div>
                <span className="font-semibold text-white text-sm tracking-wide">
                    {name}
                </span>
            </div>
        </div>
    );
}
