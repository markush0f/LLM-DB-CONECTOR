import time
from typing import Any, Dict, Optional


class MetadataCache:
    # Initializes cache storage and optional TTL expiration
    def __init__(self, ttl_seconds: Optional[int] = None):
        self.cache: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self.ttl = ttl_seconds
        self.timestamps: Dict[str, float] = {}

    # Builds a unique key for TTL tracking using schema.table
    def _make_key(self, schema: str, table: str) -> str:
        return f"{schema}.{table}"

    # Checks if a cached entry is expired based on TTL
    def _is_expired(self, key: str) -> bool:
        if self.ttl is None:
            return False
        ts = self.timestamps.get(key)
        if ts is None:
            return False
        return (time.time() - ts) > self.ttl

    # Retrieves table metadata and validates TTL
    def get_table(self, schema: str, table: str) -> Optional[Dict[str, Any]]:
        key = self._make_key(schema, table)

        if self._is_expired(key):
            self.invalidate_table(schema, table)
            return None

        return self.cache.get(schema, {}).get(table)

    # Stores metadata for a table and records timestamp
    def store_table(self, schema: str, table: str, metadata: Dict[str, Any]) -> None:
        if schema not in self.cache:
            self.cache[schema] = {}
        self.cache[schema][table] = metadata
        self.timestamps[self._make_key(schema, table)] = time.time()

    # Removes cached metadata for one specific table
    def invalidate_table(self, schema: str, table: str) -> None:
        if schema in self.cache and table in self.cache[schema]:
            del self.cache[schema][table]
        self.timestamps.pop(self._make_key(schema, table), None)

    # Removes cached metadata for all tables inside a schema
    def invalidate_schema(self, schema: str) -> None:
        if schema in self.cache:
            for table in list(self.cache[schema].keys()):
                self.timestamps.pop(self._make_key(schema, table), None)
            del self.cache[schema]

    # Clears the entire metadata cache
    def invalidate_all(self) -> None:
        self.cache.clear()
        self.timestamps.clear()
