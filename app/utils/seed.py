from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.device import Device
from app.models.interface import Interface
from app.models.ip_address import IPAddress
from app.models.vlan import Vlan
from app.models.validation import Validation

async def seed_database(db: AsyncSession) -> bool:
    """
    Popula o banco de dados com dispositivos de teste (Huawei) e validações.
    Retorna True se os dados foram inseridos, False se o banco já possuía dados.
    """
    # Verifica se já existem dispositivos
    result = await db.execute(select(Device).limit(1))
    if result.scalars().first():
        return False  # Banco já possui dados

    # Criando Devices
    devices_data = [
        {"name": "CORE-01", "ip": "10.0.0.1", "vendor": "huawei", "status": "active"},
        {"name": "CORE-02", "ip": "10.0.0.2", "vendor": "huawei", "status": "active"},
        {"name": "DIST-01", "ip": "10.0.1.1", "vendor": "huawei", "status": "active"},
        {"name": "DIST-02", "ip": "10.0.1.2", "vendor": "huawei", "status": "offline"},
        {"name": "ACCESS-01", "ip": "10.0.2.1", "vendor": "huawei", "status": "active"},
    ]

    devices_obj = []
    for d in devices_data:
        dev = Device(
            name=d["name"],
            ip_address=d["ip"],
            vendor=d["vendor"],
            status=d["status"]
        )
        db.add(dev)
        devices_obj.append(dev)
    
    await db.commit()

    # Recarregando para obter IDs
    for dev in devices_obj:
        await db.refresh(dev)

    # Inserindo Interfaces, IPs e VLANs para o CORE-01
    core1 = devices_obj[0]
    
    intf1 = Interface(device_id=core1.id, name="GigabitEthernet0/0/1", status="up", description="Link to DIST-01")
    intf2 = Interface(device_id=core1.id, name="GigabitEthernet0/0/2", status="down", description="Link to DIST-02")
    db.add_all([intf1, intf2])
    await db.commit()
    await db.refresh(intf1)

    ip1 = IPAddress(device_id=core1.id, interface_id=intf1.id, address="10.0.0.1", netmask="255.255.255.255")
    db.add(ip1)

    vlan1 = Vlan(device_id=core1.id, vlan_id=10, name="MGMT")
    vlan2 = Vlan(device_id=core1.id, vlan_id=20, name="USERS")
    db.add_all([vlan1, vlan2])

    # Validações Fakes para o CORE-01
    val1 = Validation(
        device_id=core1.id, 
        type="Interface Status", 
        severity="CRITICAL", 
        source="device", 
        message="Interface GigabitEthernet0/0/2 is DOWN but configured."
    )
    val2 = Validation(
        device_id=core1.id, 
        type="Configuration", 
        severity="WARNING", 
        source="netbox", 
        message="Interface GigabitEthernet0/0/1 without description in NetBox."
    )
    val3 = Validation(
        device_id=core1.id, 
        type="BGP Session", 
        severity="INFO", 
        source="device", 
        message="BGP session with 10.0.0.2 established."
    )
    db.add_all([val1, val2, val3])

    # Adicionando alguns alertas para outros devices
    dist2 = devices_obj[3]
    val4 = Validation(
        device_id=dist2.id,
        type="System Status",
        severity="CRITICAL",
        source="librenms",
        message="Device DIST-02 is OFFLINE."
    )
    db.add(val4)

    await db.commit()
    return True
