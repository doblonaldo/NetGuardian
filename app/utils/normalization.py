from typing import Dict, List, Any
from pydantic import BaseModel, Field

# ==========================================
# Schemas para o Formato Único (Single Source of Truth)
# ==========================================

class NormalizedInterface(BaseModel):
    name: str
    status: str
    description: str = ""

class NormalizedIP(BaseModel):
    interface: str = ""
    address: str
    netmask: str

class NormalizedVlan(BaseModel):
    vlan_id: int
    name: str = ""

class NormalizedDevice(BaseModel):
    interfaces: List[NormalizedInterface] = Field(default_factory=list)
    ips: List[NormalizedIP] = Field(default_factory=list)
    vlans: List[NormalizedVlan] = Field(default_factory=list)


# ==========================================
# Funções de Normalização
# ==========================================

def normalize_device_data(parsed_data: Dict[str, Any]) -> NormalizedDevice:
    """
    Normaliza os dados extraídos diretamente do equipamento via CLI/Parsers (ex: Huawei VRP, Cisco IOS).
    """
    interfaces = [
        NormalizedInterface(
            name=intf.get("name", ""),
            status=str(intf.get("status", "down")).lower(),
            description=intf.get("description", "")
        )
        for intf in parsed_data.get("interfaces", [])
    ]
    
    ips = [
        NormalizedIP(
            interface=ip.get("interface", ""),
            address=ip.get("ip", ""),
            netmask=str(ip.get("mask", ""))
        )
        for ip in parsed_data.get("ips", [])
    ]
    
    vlans = [
        NormalizedVlan(
            vlan_id=int(vlan.get("vlan_id", 0)),
            name=vlan.get("name", "")
        )
        for vlan in parsed_data.get("vlans", [])
    ]
    
    return NormalizedDevice(interfaces=interfaces, ips=ips, vlans=vlans)

def normalize_netbox_data(netbox_interfaces: List[Dict], netbox_ips: List[Dict], netbox_vlans: List[Dict]) -> NormalizedDevice:
    """
    Normaliza os dados oriundos da API do NetBox para um dispositivo específico.
    """
    interfaces = [
        NormalizedInterface(
            name=intf.get("name", ""),
            status="up" if intf.get("status") == "active" else "down",
            description=intf.get("description", "")
        )
        for intf in netbox_interfaces
    ]
    
    ips = [
        NormalizedIP(
            interface=ip.get("interface_name") or "",
            address=ip.get("address", ""),
            netmask=str(ip.get("netmask", ""))
        )
        for ip in netbox_ips
    ]
    
    vlans = [
        NormalizedVlan(
            vlan_id=int(vlan.get("vlan_id", 0)),
            name=vlan.get("name", "")
        )
        for vlan in netbox_vlans
    ]
    
    return NormalizedDevice(interfaces=interfaces, ips=ips, vlans=vlans)

def normalize_librenms_data(librenms_ports: List[Dict]) -> NormalizedDevice:
    """
    Normaliza os dados operacionais mapeados pelo LibreNMS via SNMP.
    """
    interfaces = [
        NormalizedInterface(
            name=port.get("name", ""),
            status=str(port.get("status", "down")).lower(),
            description=port.get("description", "")
        )
        for port in librenms_ports
    ]
    
    return NormalizedDevice(interfaces=interfaces, ips=[], vlans=[])
