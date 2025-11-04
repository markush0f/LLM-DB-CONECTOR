// components/diagram/TableNode.tsx
import React from "react";
import { Handle, Position } from "@xyflow/react";

export default function TableNode({ data }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[260px]">
      {/* Header */}
      <div className="drag-handle relative bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 cursor-grab active:cursor-grabbing group">
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center gap-2.5">
          <div className="p-1.5 bg-white/15 rounded backdrop-blur-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-wide">{data.name}</span>
        </div>
      </div>

      {/* Columnas */}
      <div className="divide-y divide-slate-100">
        {data.columns.map((col: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50/40 transition-all duration-200 relative"
          >
            <div className="flex items-center gap-2.5 flex-1">
              {col.isPK && (
                <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-500 shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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

            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">{col.type}</span>

            {/* Handles invisibles */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${data.name}-${col.name}-target`}
              className="opacity-0 pointer-events-none"
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`${data.name}-${col.name}-source`}
              className="opacity-0 pointer-events-none"
            />
          </div>
        ))}
      </div>

      <div className="h-0.5 bg-gradient-to-r from-orange-400 to-orange-500"></div>
    </div>
  );
}
