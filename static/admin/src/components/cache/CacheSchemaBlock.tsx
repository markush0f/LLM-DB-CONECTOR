import { Database, Trash2 } from "lucide-react";
import CacheTableItem from "./CacheTableItem";
import type { NormalizedTable } from "../../types/cache.types";


export interface CacheSchemaBlockProps {
    schema: string;
    tables: NormalizedTable[];
    onClearSchema: (schema: string) => void;
    onClearTable: (schema: string, table: string) => void;
    onRefreshTable: (schema: string, table: string) => void;
}

export default function CacheSchemaBlock({
    schema,
    tables,
    onClearSchema,
    onClearTable,
    onRefreshTable
}: CacheSchemaBlockProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Database />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{schema}</h3>
                        <p className="text-sm text-gray-600">{tables.length} tables</p>
                    </div>
                </div>

                <button
                    onClick={() => onClearSchema(schema)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1.5"
                >
                    <Trash2 />
                    Clear Schema
                </button>
            </div>

            <div className="divide-y divide-gray-200">
                {tables.map((t) => (
                    <CacheTableItem
                        key={t.table}
                        {...t}
                        onClear={() => onClearTable(schema, t.table)}
                        onRefresh={() => onRefreshTable(schema, t.table)}
                    />
                ))}
            </div>

        </div>
    );
}
