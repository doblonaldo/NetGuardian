from typing import List, Dict
from collections import Counter
from app.utils.normalization import NormalizedDevice

def validate_ips(device_data: NormalizedDevice, netbox_data: NormalizedDevice) -> List[Dict]:
    """
    Executa a auditoria de endereços IP configurados nas interfaces do dispositivo.
    """
    validations = []
    
    device_ips = [ip.address for ip in device_data.ips]
    netbox_ips = {ip.address for ip in netbox_data.ips}
    
    # Regra 1: IP Duplicado localmente no próprio equipamento (configuração errada ou loopback confuso)
    ip_counts = Counter(device_ips)
    for ip, count in ip_counts.items():
        if count > 1 and ip:  # Ignora contagens de strings vazias, se existirem
            validations.append({
                "type": "ip_duplicate",
                "severity": "CRITICAL",
                "source": "device",
                "message": f"Conflito local: O endereço IP {ip} foi detectado {count} vezes em interfaces diferentes do equipamento."
            })
            
    # Regra 2: Não documentado no NetBox
    unique_device_ips = set(device_ips)
    for ip in unique_device_ips - netbox_ips:
        if ip:
            validations.append({
                "type": "ip_undocumented",
                "severity": "WARNING",
                "source": "device",
                "message": f"Endereço IP {ip} está em uso no equipamento, mas não consta no NetBox."
            })
        
    return validations
