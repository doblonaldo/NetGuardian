from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.collectors.factory import CollectorFactory

router = APIRouter()

@router.post("/trigger")
async def trigger_collection(device_id: int, db: AsyncSession = Depends(get_db)):
    """
    Trigger configuration and state collection from a network device.
    """
    # In a real scenario, device would be fetched from DB
    # device = await crud.get_device(db, device_id)
    # fake DB device for demo purposes:
    class FakeDevice:
        ip_address = "192.168.1.1"
        vendor = "cisco_ios"
    
    device = FakeDevice()
    collector = CollectorFactory.get_collector(device.vendor, host=device.ip_address)
    
    # Ideally, this would run asynchronously via a worker queue
    status = await collector.collect_facts()
    
    return {"message": "Collection triggered", "status": status}
