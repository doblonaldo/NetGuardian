from typing import List, Dict
from app.utils.normalization import NormalizedDevice

def validate_interfaces(device_data: NormalizedDevice, netbox_data: NormalizedDevice, librenms_data: NormalizedDevice) -> List[Dict]:
    """
    Executa a auditoria de estado e documentação de Interfaces, cruzando Device, NetBox e LibreNMS.
    """
    validations = []
    
    # Mapear interfaces por nome para O(1) de acesso
    netbox_map = {intf.name: intf for intf in netbox_data.interfaces}
    librenms_map = {intf.name: intf for intf in librenms_data.interfaces}
    
    # Regra 1: Validações a partir do ponto de vista da configuração do device (cli_data)
    for device_intf in device_data.interfaces:
        intf_name = device_intf.name
        
        # Sub-regra A: Interface sem descrição
        if not device_intf.description or device_intf.description.strip() == "":
            validations.append({
                "type": "interface_no_description",
                "severity": "INFO",
                "source": "device",
                "message": f"Interface {intf_name} não possui descrição configurada."
            })

    # Regra 2: Down no LibreNMS mas ativa no NetBox
    # Percorremos as interfaces do LibreNMS (que trazem o link state operacional)
    for lnms_intf in librenms_data.interfaces:
        intf_name = lnms_intf.name
        nb_intf = netbox_map.get(intf_name)
        
        if nb_intf:
            if lnms_intf.status == "down" and nb_intf.status == "up":
                validations.append({
                    "type": "interface_down_but_active",
                    "severity": "CRITICAL",
                    "source": "librenms",
                    "message": f"Interface {intf_name} está fisicamente/operacionalmente DOWN, mas marcada como ACTIVE no NetBox."
                })
                
    return validations
