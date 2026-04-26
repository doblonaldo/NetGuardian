import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.device import Device
from app.models.validation import Validation
from app.collectors.factory import CollectorFactory
from app.core.config import settings
from app.parsers.huawei_parser import HuaweiParser
from app.services.netbox_service import NetboxService
from app.services.librenms_service import LibreNMSService
from app.utils.normalization import normalize_device_data, normalize_netbox_data, normalize_librenms_data
from app.validators.vlan_validator import validate_vlans
from app.validators.ip_validator import validate_ips
from app.validators.interface_validator import validate_interfaces

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_collect_and_validate(device_id: int, db: AsyncSession):
    """
    Pipeline principal: Acionado em background para fazer todo o processo de ETL e Auditoria.
    """
    try:
        # 1. Buscar device
        result = await db.execute(select(Device).where(Device.id == device_id))
        device = result.scalars().first()
        if not device:
            logger.error(f"Pipeline cancelado: Device ID {device_id} não encontrado.")
            return

        logger.info(f"[{device.name}] Iniciando pipeline de validação.")
        netbox_service = NetboxService()
        librenms_service = LibreNMSService()

        # 2. Coletar via collector
        # Puxando as credenciais de forma segura do cofre/env invés de hardcode
        collector = CollectorFactory.get_collector(
            vendor=device.vendor.lower(),
            host=device.ip_address,
            credentials={"username": settings.DEVICE_DEFAULT_USERNAME, "password": settings.DEVICE_DEFAULT_PASSWORD}
        )
        raw_data = await collector.collect_facts()

        # 3. Parsear dados
        if device.vendor.lower() == "huawei":
            parser = HuaweiParser(raw_data)
            parsed_data = parser.parse()
        else:
            logger.error(f"[{device.name}] Vendor '{device.vendor}' não possui parser associado.")
            return

        # 4. Buscar dados do NetBox
        # Para otimização extrairíamos filtrando via query param direto da API
        nb_interfaces_all = await netbox_service.get_interfaces()
        nb_ips_all = await netbox_service.get_ips()
        nb_vlans = await netbox_service.get_vlans() 
        
        nb_interfaces = [i for i in nb_interfaces_all if i.get("device_name") == device.name]
        nb_ips = [i for i in nb_ips_all if i.get("device_name") == device.name]

        # 5. Buscar dados do LibreNMS (buscando direto pelo nome)
        lnms_ports = await librenms_service.get_ports(hostname=device.name)

        # 6. Normalizar tudo para Single Source of Truth
        norm_device = normalize_device_data(parsed_data)
        norm_netbox = normalize_netbox_data(nb_interfaces, nb_ips, nb_vlans)
        norm_librenms = normalize_librenms_data(lnms_ports)

        # 7. Executar validações
        all_validations = []
        all_validations.extend(validate_vlans(norm_device, norm_netbox))
        all_validations.extend(validate_ips(norm_device, norm_netbox))
        all_validations.extend(validate_interfaces(norm_device, norm_netbox, norm_librenms))

        # 8. Salvar no banco
        # Apagamos eventuais resquícios de validações da auditoria passada para este device
        await db.execute(delete(Validation).where(Validation.device_id == device.id))
        
        for val_dict in all_validations:
            db.add(Validation(
                device_id=device.id,
                type=val_dict["type"],
                severity=val_dict["severity"],
                source=val_dict["source"],
                message=val_dict["message"]
            ))
            
        await db.commit()
        logger.info(f"[{device.name}] Pipeline concluído com sucesso. {len(all_validations)} inconsistências encontradas.")

    except Exception as e:
        logger.error(f"[{device_id}] Erro fatal no pipeline de execução: {str(e)}")
        await db.rollback()
