from .storage_repository import StorageRepository

# Singleton instance
storage_repo = StorageRepository()

__all__ = ["storage_repo", "StorageRepository"]