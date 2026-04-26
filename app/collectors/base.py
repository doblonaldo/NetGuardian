from abc import ABC, abstractmethod

class BaseCollector(ABC):
    def __init__(self, host: str, credentials: dict = None):
        self.host = host
        self.credentials = credentials or {}

    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def collect_facts(self) -> dict:
        pass
        
    @abstractmethod
    async def disconnect(self):
        pass
