SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND (:schema_name IS NULL OR table_schema = :schema_name)
ORDER BY table_schema, table_name, ordinal_position;

