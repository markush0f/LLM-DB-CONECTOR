SELECT 
    tc.table_schema, 
    tc.table_name, 
    kc.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kc
  ON tc.constraint_name = kc.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
ORDER BY table_schema, table_name;
