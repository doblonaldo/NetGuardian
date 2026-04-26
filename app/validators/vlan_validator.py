from typing import List, Dict
from app.utils.normalization import NormalizedDevice

def validate_vlans(device_data: NormalizedDevice, netbox_data: NormalizedDevice) -> List[Dict]:
    """
    Executa a auditoria das VLANs, cruzando a configuração do Device com a documentação (NetBox).
    """
    validations = []
    
    # Extrai sets de IDs para otimizar comparações
    device_vlans = {v.vlan_id for v in device_data.vlans}
    netbox_vlans = {v.vlan_id for v in netbox_data.vlans}
    
    # Regra 1: Existe no device e não no NetBox (Não documentada)
    for v_id in device_vlans - netbox_vlans:
        validations.append({
            "type": "vlan_undocumented",
            "severity": "WARNING",
            "source": "device",
            "message": f"VLAN {v_id} configurada no equipamento, mas não está documentada no NetBox."
        })
        
    # A regra que verificava VLANs documentadas no NetBox mas ausentes no Device foi removida
    # pois VLANs no NetBox geralmente possuem escopo de Site ou Global, o que gerava falso-positivos
    # para switches individuais que não precisavam carregar todas as VLANs do site.
    
    return validations
