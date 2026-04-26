import httpx
from typing import List, Dict, Any
from app.core.config import settings

class NetboxService:
    def __init__(self):
        self.base_url = settings.NETBOX_URL.rstrip('/') if settings.NETBOX_URL else ""
        self.headers = {
            "Authorization": f"Token {settings.NETBOX_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    async def _fetch_all(self, endpoint: str) -> List[Dict[str, Any]]:
        results = []
        url = f"{self.base_url}{endpoint}"
        async with httpx.AsyncClient() as client:
            while url:
                response = await client.get(url, headers=self.headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                results.extend(data.get("results", []))
                url = data.get("next")
        return results

    async def get_devices(self) -> List[Dict[str, Any]]:
        raw_devices = await self._fetch_all("/api/dcim/devices/")
        normalized = []
        for dev in raw_devices:
            # Extract primary IP
            primary_ip = None
            if dev.get("primary_ip4"):
                primary_ip = dev["primary_ip4"]["address"].split("/")[0]

            if not primary_ip:
                continue

            vendor = "unknown"
            if dev.get("device_type") and dev["device_type"].get("manufacturer"):
                vendor = dev["device_type"]["manufacturer"].get("slug", "unknown")

            normalized.append({
                "name": dev.get("name") or "Unnamed",
                "ip_address": primary_ip,
                "vendor": vendor,
                "status": dev.get("status", {}).get("value", "active")
            })
        return normalized

    async def get_interfaces(self) -> List[Dict[str, Any]]:
        raw_interfaces = await self._fetch_all("/api/dcim/interfaces/")
        normalized = []
        for intf in raw_interfaces:
            normalized.append({
                "device_name": intf["device"]["name"] if intf.get("device") else None,
                "name": intf.get("name"),
                "status": "active" if intf.get("enabled") else "disabled",
                "description": intf.get("description", "")
            })
        return normalized

    async def get_ips(self) -> List[Dict[str, Any]]:
        raw_ips = await self._fetch_all("/api/ipam/ip-addresses/")
        normalized = []
        for ip in raw_ips:
            address_full = ip.get("address", "")
            address = address_full.split("/")[0] if "/" in address_full else address_full
            netmask = address_full.split("/")[1] if "/" in address_full else "32"
            
            interface_name = None
            device_name = None
            
            if ip.get("assigned_object_type") == "dcim.interface" and ip.get("assigned_object"):
                interface_name = ip["assigned_object"].get("name")
                if ip["assigned_object"].get("device"):
                    device_name = ip["assigned_object"]["device"].get("name")

            normalized.append({
                "address": address,
                "netmask": netmask,
                "interface_name": interface_name,
                "device_name": device_name
            })
        return normalized

    async def get_vlans(self) -> List[Dict[str, Any]]:
        raw_vlans = await self._fetch_all("/api/ipam/vlans/")
        normalized = []
        for vlan in raw_vlans:
            normalized.append({
                "vlan_id": vlan.get("vid"),
                "name": vlan.get("name")
            })
        return normalized
