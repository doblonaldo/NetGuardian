import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

class LibreNMSService:
    def __init__(self):
        self.base_url = settings.LIBRENMS_URL.rstrip('/') if settings.LIBRENMS_URL else ""
        self.headers = {
            "X-Auth-Token": settings.LIBRENMS_TOKEN,
            "Accept": "application/json"
        }

    async def get_devices(self) -> List[Dict[str, Any]]:
        """
        Obtém a lista de dispositivos do LibreNMS.
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v0/devices", headers=self.headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                normalized = []
                for dev in data.get("devices", []):
                    normalized.append({
                        "device_id": dev.get("device_id"),
                        "hostname": dev.get("hostname"),
                        "ip_address": dev.get("ip"),
                        "vendor": dev.get("os"),
                        "status": "up" if dev.get("status") == 1 else "down",
                        "uptime": dev.get("uptime")
                    })
                return normalized
        except httpx.RequestError as e:
            raise ValueError(f"Erro de comunicação com LibreNMS: {str(e)}")
        except Exception as e:
            raise ValueError(f"Erro inesperado ao buscar devices no LibreNMS: {str(e)}")

    async def get_ports(self, hostname: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Obtém a lista de portas. Se um hostname for passado, filtra por ele.
        """
        try:
            url = f"{self.base_url}/api/v0/ports"
            if hostname:
                url = f"{self.base_url}/api/v0/devices/{hostname}/ports"
                
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=15.0)
                response.raise_for_status()
                data = response.json()
                
                normalized = []
                ports_list = data.get("ports", [])
                
                for port in ports_list:
                    normalized.append({
                        "port_id": port.get("port_id"),
                        "device_id": port.get("device_id"),
                        "hostname": port.get("hostname"),
                        "name": port.get("ifName") or port.get("ifDescr"),
                        "status": "up" if port.get("ifOperStatus") == "up" else "down",
                        "description": port.get("ifAlias"),
                        "mac_address": port.get("ifPhysAddress")
                    })
                return normalized
        except httpx.RequestError as e:
            raise ValueError(f"Erro de comunicação com LibreNMS ao buscar portas: {str(e)}")

    async def get_port_status(self, port_id: int) -> Dict[str, Any]:
        """
        Obtém status detalhado e métricas básicas (in/out rate, erros) de uma porta específica.
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v0/ports/{port_id}", headers=self.headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                # A API do LibreNMS pode retornar como dict ou list dentro de 'port'
                port_data = data.get("port", [{}])[0] if isinstance(data.get("port"), list) else data.get("port", {})
                
                return {
                    "port_id": port_data.get("port_id"),
                    "name": port_data.get("ifName"),
                    "status": "up" if port_data.get("ifOperStatus") == "up" else "down",
                    "admin_status": "up" if port_data.get("ifAdminStatus") == "up" else "down",
                    # Convertendo octets rate para bits per second
                    "in_rate_bps": port_data.get("ifInOctets_rate", 0) * 8,
                    "out_rate_bps": port_data.get("ifOutOctets_rate", 0) * 8,
                    "errors_in": port_data.get("ifInErrors", 0),
                    "errors_out": port_data.get("ifOutErrors", 0)
                }
        except httpx.RequestError as e:
            raise ValueError(f"Erro de comunicação ao buscar status da porta {port_id}: {str(e)}")
