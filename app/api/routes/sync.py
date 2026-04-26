from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.services.netbox_service import NetboxService
from app.models.device import Device
from app.models.interface import Interface
from app.models.ip_address import IPAddress
from app.models.vlan import Vlan

router = APIRouter()

@router.post("/netbox")
async def sync_netbox(db: AsyncSession = Depends(get_db)):
    """
    Synchronize data from NetBox with local database.
    """
    try:
        netbox = NetboxService()
        
        # 1. Sync Devices
        nb_devices = await netbox.get_devices()
        device_map = {} 
        for nb_dev in nb_devices:
            result = await db.execute(select(Device).where(Device.ip_address == nb_dev["ip_address"]))
            device = result.scalars().first()
            if not device:
                result_by_name = await db.execute(select(Device).where(Device.name == nb_dev["name"]))
                device = result_by_name.scalars().first()

            if device:
                device.name = nb_dev["name"]
                device.ip_address = nb_dev["ip_address"]
                device.vendor = nb_dev["vendor"]
                device.status = nb_dev["status"]
            else:
                device = Device(**nb_dev)
                db.add(device)
            
            await db.flush()
            device_map[device.name] = device.id
            
        # 2. Sync Interfaces
        nb_interfaces = await netbox.get_interfaces()
        interface_map = {}
        for nb_intf in nb_interfaces:
            dev_name = nb_intf["device_name"]
            dev_id = device_map.get(dev_name)
            if not dev_id:
                continue 
                
            result = await db.execute(select(Interface).where(Interface.device_id == dev_id, Interface.name == nb_intf["name"]))
            intf = result.scalars().first()
            if intf:
                intf.status = nb_intf["status"]
                intf.description = nb_intf["description"]
            else:
                intf = Interface(
                    device_id=dev_id,
                    name=nb_intf["name"],
                    status=nb_intf["status"],
                    description=nb_intf["description"]
                )
                db.add(intf)
            
            await db.flush()
            interface_map[(dev_id, intf.name)] = intf.id

        # 3. Sync IPs
        nb_ips = await netbox.get_ips()
        for nb_ip in nb_ips:
            dev_name = nb_ip["device_name"]
            intf_name = nb_ip["interface_name"]
            
            dev_id = device_map.get(dev_name) if dev_name else None
            intf_id = interface_map.get((dev_id, intf_name)) if dev_id and intf_name else None
            
            if not dev_id:
                continue 
                
            result = await db.execute(select(IPAddress).where(IPAddress.device_id == dev_id, IPAddress.address == nb_ip["address"]))
            ip_obj = result.scalars().first()
            if ip_obj:
                ip_obj.interface_id = intf_id
                ip_obj.netmask = nb_ip["netmask"]
            else:
                ip_obj = IPAddress(
                    device_id=dev_id,
                    interface_id=intf_id,
                    address=nb_ip["address"],
                    netmask=nb_ip["netmask"]
                )
                db.add(ip_obj)

        await db.commit()
        return {"message": "Sincronização com NetBox concluída com sucesso!"}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
