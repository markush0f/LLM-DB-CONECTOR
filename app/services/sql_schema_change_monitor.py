import re
from typing import List, Optional, Tuple

from app.core.logger import create_logger
from app.services.metadata_cache import MetadataCache


class SqlSchemaChangeMonitor:
    def __init__(self, cache: MetadataCache):
        self.cache = cache
        self.logger = create_logger()

    def is_schema_change(self, sql: str) -> bool:
        pattern = r"\b(ALTER|CREATE|DROP)\b\s+\b(TABLE|VIEW|INDEX|SCHEMA)\b"
        return re.search(pattern, sql, re.IGNORECASE) is not None

    def extract_affected_objects(self, sql: str) -> List[Tuple[Optional[str], str]]:
        pattern = r"\b(?:ALTER|CREATE|DROP)\b\s+\b(?:TABLE|VIEW)\b\s+((?:\w+\.)?\w+)"
        matches = re.findall(pattern, sql, re.IGNORECASE)

        results: List[Tuple[Optional[str], str]] = []

        for name in matches:
            parts = name.split(".")
            if len(parts) == 2:
                schema, table = parts[0].lower(), parts[1].lower()
            else:
                schema, table = None, parts[0].lower()
            results.append((schema, table))

        return results

    def handle_schema_change(self, sql: str) -> None:
        if not self.is_schema_change(sql):
            return

        affected = self.extract_affected_objects(sql)

        if not affected:
            self.cache.invalidate_all()
            self.logger.info("Schema change detected, invalidated entire metadata cache")
            return

        for schema, table in affected:
            if schema and table:
                self.cache.invalidate_table(schema, table)
                self.logger.info("Invalidated cache for %s.%s", schema, table)
            elif table:
                for sch in list(self.cache.cache.keys()):
                    if table in self.cache.cache.get(sch, {}):
                        self.cache.invalidate_table(sch, table)
                        self.logger.info("Invalidated cache for %s.%s", sch, table)
