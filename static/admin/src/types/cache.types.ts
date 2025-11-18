// Column metadata
export interface ColumnMetadata {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
    is_primary_key: boolean;
    foreign_table_name: string | null;
    foreign_column_name: string | null;
}

// Table metadata
export interface TableMetadata {
    columns: ColumnMetadata[];
    primary_keys: string[];
    foreign_keys: string[];
}

// A cached table entry in the backend raw format
export interface RawTableCacheEntry {
    cached_at: number;
    expires_in: number;
    metadata: TableMetadata;
}

// A schema containing multiple tables
export interface RawSchemaCache {
    [tableName: string]: RawTableCacheEntry;
}

// Full response from backend
export interface RawCacheResponse {
    ttl_seconds: number;
    schemas: {
        [schemaName: string]: RawSchemaCache;
    };
    total_entries: number;
}

// Normalized table for the frontend UI
export interface NormalizedTable {
    schema: string;
    table: string;
    cachedAt: string;
    expiresIn: number;
    columns: number;
    rows: number; // frontend will calculate or 0 fallback
    size: string; // we can calculate later or "--"
}
