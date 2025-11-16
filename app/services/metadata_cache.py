import time
from typing import Any, Dict, Optional
from app.core.logger import create_logger


class MetadataCache:
    def __init__(self, ttl_seconds: Optional[int] = None):
        self.cache: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self.ttl = ttl_seconds
        self.timestamps: Dict[str, float] = {}
        # CHANGE: logger for cache events
        self.logger = create_logger()

    def _make_key(self, schema: str, table: str) -> str:
        return f"{schema}.{table}"

    def _is_expired(self, key: str) -> bool:
        if self.ttl is None:
            return False
        ts = self.timestamps.get(key)
        if ts is None:
            return False
        expired = (time.time() - ts) > self.ttl
        if expired:
            self.logger.info("Cache expired for key=%s", key)
        return expired

    def get_table(self, schema: str, table: str) -> Optional[Dict[str, Any]]:
        key = self._make_key(schema, table)

        if self._is_expired(key):
            self.logger.info("Evicting expired cache entry for %s.%s", schema, table)
            self.invalidate_table(schema, table)
            return None

        entry = self.cache.get(schema, {}).get(table)

        if entry:
            self.logger.info("Cache hit for %s.%s", schema, table)
        else:
            self.logger.info("Cache miss for %s.%s", schema, table)

        return entry

    def store_table(self, schema: str, table: str, metadata: Dict[str, Any]) -> None:
        if schema not in self.cache:
            self.cache[schema] = {}

        self.cache[schema][table] = metadata
        self.timestamps[self._make_key(schema, table)] = time.time()

        # CHANGE: log storing event
        self.logger.info("Stored metadata in cache for %s.%s", schema, table)

    def invalidate_table(self, schema: str, table: str) -> None:
        if schema in self.cache and table in self.cache[schema]:
            del self.cache[schema][table]
        self.timestamps.pop(self._make_key(schema, table), None)

        self.logger.warning("Invalidated cache entry for %s.%s", schema, table)

    def invalidate_schema(self, schema: str) -> None:
        if schema in self.cache:
            for table in list(self.cache[schema].keys()):
                self.timestamps.pop(self._make_key(schema, table), None)
            del self.cache[schema]

        self.logger.warning("Invalidated entire schema from cache: %s", schema)

    def invalidate_all(self) -> None:
        self.cache.clear()
        self.timestamps.clear()

        self.logger.warning("Invalidated entire metadata cache")
        # CHANGE: expose cache status for debugging

    def get_status(self) -> Dict[str, Any]:
        status = {
            "ttl_seconds": self.ttl,
            "schemas": {},
            "total_entries": 0,
        }

        for schema, tables in self.cache.items():
            status["schemas"][schema] = {}
            for table in tables.keys():
                key = self._make_key(schema, table)
                ts = self.timestamps.get(key, 0)
                remaining = None

                if self.ttl is not None:
                    remaining = max(self.ttl - (time.time() - ts), 0)

                status["schemas"][schema][table] = {
                    "cached_at": ts,
                    "expires_in": remaining,
                }

                status["total_entries"] += 1

        return status
