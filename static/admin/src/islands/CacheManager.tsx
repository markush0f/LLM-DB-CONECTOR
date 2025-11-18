import { useEffect, useState } from "react";
import {
    fetchCache,
    invalidateAllCache,
    invalidateSchema,
    invalidateTable
} from "../lib/api/cache";

import CacheSchemaBlock from "../components/cache/CacheSchemaBlock";
import type { NormalizedTable, RawCacheResponse } from "../types/cache.types";
import "../styles/global.css"

export default function CacheManager() {
    const [cache, setCache] = useState<Record<string, NormalizedTable[]>>({});
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        ttl: 0,
        totalEntries: 0,
        schemasCount: 0
    });

    function normalize(raw: RawCacheResponse): Record<string, NormalizedTable[]> {
        const result: Record<string, NormalizedTable[]> = {};

        for (const schemaName in raw.schemas) {
            const tablesObj = raw.schemas[schemaName];
            result[schemaName] = [];

            for (const tableName in tablesObj) {
                const table = tablesObj[tableName];

                result[schemaName].push({
                    schema: schemaName,
                    table: tableName,
                    cachedAt: new Date(table.cached_at * 1000).toLocaleString(),
                    expiresIn: table.expires_in,
                    columns: table.metadata.columns.length,
                    rows: 0,
                    size: "--"
                });
            }
        }

        return result;
    }

    async function load() {
        setLoading(true);

        const raw: RawCacheResponse = await fetchCache();

        setCache(normalize(raw));

        setStats({
            ttl: raw.ttl_seconds,
            totalEntries: raw.total_entries,
            schemasCount: Object.keys(raw.schemas).length
        });

        setLoading(false);
    }

    async function handleClearAll() {
        await invalidateAllCache();
        load();
    }

    async function handleClearSchema(schema: string) {
        await invalidateSchema(schema);
        load();
    }

    async function handleClearTable(schema: string, table: string) {
        await invalidateTable(schema, table);
        load();
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) return <p className="text-gray-500">Loading cache...</p>;

    return (
        <div className="space-y-6">
            {Object.entries(cache).map(([schema, tables]) => (
                <CacheSchemaBlock
                    key={schema}
                    schema={schema}
                    tables={tables}
                    onClearSchema={handleClearSchema}
                    onClearTable={handleClearTable}
                    onRefreshTable={load}
                />
            ))}

            <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
                Clear All Cache
            </button>
        </div>
    );
}
