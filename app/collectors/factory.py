from typing import Type
from app.collectors.base import BaseCollector
from app.collectors.cisco_ios import CiscoIOSCollector
# Import other collectors...

class CollectorFactory:
    _collectors = {
        "cisco_ios": CiscoIOSCollector,
        # "juniper_junos": JuniperJunosCollector,
    }

    @classmethod
    def get_collector(cls, vendor: str, host: str, credentials: dict = None) -> BaseCollector:
        collector_class = cls._collectors.get(vendor)
        if not collector_class:
            raise ValueError(f"No collector implemented for vendor: {vendor}")
        return collector_class(host=host, credentials=credentials)
