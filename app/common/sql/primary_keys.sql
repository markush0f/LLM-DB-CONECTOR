SELECT 
    tc.table_schema, 
    tc.table_name, 
    kc.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kc
  ON tc.constraint_name = kc.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND (:schema_name IS NULL OR tc.table_schema = :schema_name)
ORDER BY tc.table_schema, tc.table_name;
