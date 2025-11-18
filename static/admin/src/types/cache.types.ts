// CHANGE: full typing aligned with backend structure

export interface ColumnMetadata {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
    is_primary_key: boolean;
    foreign_table_name: string | null;
    foreign_column_name: string | null;
}

export interface TableMetadata {
    columns: ColumnMetadata[];
    primary_keys: string[];
    foreign_keys: string[];
}

export interface RawTableCacheEntry {
    cached_at: number;
    expires_in: number;
    metadata: TableMetadata;
}

export interface RawSchemaCache {
    [tableName: string]: RawTableCacheEntry;
}

export interface RawCacheResponse {
    ttl_seconds: number;
    schemas: {
        [schemaName: string]: RawSchemaCache;
    };
    total_entries: number;
}

export interface NormalizedTable {
    schema: string;
    table: string;
    cachedAt: string;
    expiresIn: number;
    columns: number;
    rows: number;
    size: string;
}
