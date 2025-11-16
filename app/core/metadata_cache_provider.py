
# Global metadata cache instance with automatic TTL
from app.services.metadata_cache import MetadataCache


metadata_cache = MetadataCache(ttl_seconds=300)
