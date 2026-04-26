import re
from typing import Dict, List, Any

class HuaweiParser:
    def __init__(self, raw_data: Dict[str, str]):
        self.config = raw_data.get("config", "")
        self.interfaces_output = raw_data.get("interfaces", "")
        self.ip_interfaces_output = raw_data.get("ip_interfaces", "")

    def parse(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Processa todos os dados brutos e retorna o dicionário estruturado.
        """
        return {
            "interfaces": self._parse_interfaces(),
            "ips": self._parse_ips(),
            "vlans": self._parse_vlans()
        }

    def _parse_interfaces(self) -> List[Dict[str, Any]]:
        """
        Extrai interfaces e o status a partir do 'display interface brief',
        e combina com as descrições da 'running-config'.
        """
        interfaces = []
        descriptions = self._extract_descriptions_from_config()
        
        # O Huawei costuma retornar:
        # Interface                   PHY   Protocol InUti OutUti   inErrors  outErrors
        # GigabitEthernet0/0/1        up    up          0%     0%          0          0
        # O estado PHY (físico) pode ser up, down ou *down
        pattern = re.compile(r"^(\S+)\s+(up|down|\*down)\s+(up|down|\*down)\s+", re.IGNORECASE)

        for line in self.interfaces_output.splitlines():
            line = line.strip()
            # Ignora linhas de cabeçalho
            if not line or line.startswith("Interface"):
                continue
            
            match = pattern.search(line)
            if match:
                intf_name = match.group(1)
                # Normaliza qualquer variação de *down para simplesmente down
                status = "up" if "up" in match.group(2).lower() else "down"
                
                interfaces.append({
                    "name": intf_name,
                    "status": status,
                    "description": descriptions.get(intf_name, "")
                })
        return interfaces

    def _extract_descriptions_from_config(self) -> Dict[str, str]:
        """
        Varre a configuração linha por linha para achar o escopo de interfaces
        e mapear suas eventuais descrições.
        """
        descriptions = {}
        current_interface = None
        
        intf_pattern = re.compile(r"^interface\s+(\S+)", re.IGNORECASE)
        desc_pattern = re.compile(r"^\s+description\s+(.+)", re.IGNORECASE)

        for line in self.config.splitlines():
            # Tenta encontrar o início de um bloco de interface
            intf_match = intf_pattern.match(line)
            if intf_match:
                current_interface = intf_match.group(1)
                continue
            
            # Se estiver dentro de um bloco de interface
            if current_interface:
                desc_match = desc_pattern.match(line)
                if desc_match:
                    descriptions[current_interface] = desc_match.group(1).strip()
                elif line.startswith("#") or line.startswith("interface"):
                    # O bloco acabou
                    current_interface = None

        return descriptions

    def _parse_ips(self) -> List[Dict[str, Any]]:
        """
        Extrai endereços IPs utilizando a saída de 'display ip interface brief'.
        """
        ips = []
        # Huawei Padrão: 
        # Interface                         IP Address/Mask      Physical   Protocol
        # GigabitEthernet0/0/1              192.168.1.1/24       up         up
        pattern = re.compile(r"^(\S+)\s+([\d\.]+)/(\d+)\s+")

        for line in self.ip_interfaces_output.splitlines():
            line = line.strip()
            if not line or line.startswith("Interface") or line.startswith("*"):
                continue

            match = pattern.search(line)
            if match:
                ips.append({
                    "interface": match.group(1),
                    "ip": match.group(2),
                    "mask": match.group(3)
                })
                
        return ips

    def _parse_vlans(self) -> List[Dict[str, Any]]:
        """
        Varre a config global e extrai todas as instâncias e criações de VLANs.
        Suporta declarações solitárias ('vlan 10') e declarações em batch ('vlan batch 10 20 to 30').
        """
        vlans = set()
        vlan_single_pattern = re.compile(r"^vlan\s+(\d+)$", re.IGNORECASE)
        vlan_batch_pattern = re.compile(r"^vlan\s+batch\s+(.+)$", re.IGNORECASE)

        for line in self.config.splitlines():
            line = line.strip()
            
            # Identifica 'vlan X'
            single_match = vlan_single_pattern.match(line)
            if single_match:
                vlans.add(int(single_match.group(1)))
                continue
                
            # Identifica 'vlan batch X Y to Z'
            batch_match = vlan_batch_pattern.match(line)
            if batch_match:
                parts = batch_match.group(1).split()
                i = 0
                while i < len(parts):
                    # Se achar o 'to', trata como range (Ex: 10 to 15)
                    if i + 2 < len(parts) and parts[i+1].lower() == "to":
                        start = int(parts[i])
                        end = int(parts[i+2])
                        for v in range(start, end + 1):
                            vlans.add(v)
                        i += 3
                    else:
                        vlans.add(int(parts[i]))
                        i += 1

        return [{"vlan_id": v} for v in sorted(vlans)]
