from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select

from app.core.database import get_db
from app.models.device import Device
from app.schemas.device import DeviceCreate, DeviceResponse

router = APIRouter()

@router.get("/", response_model=List[DeviceResponse])
async def get_devices(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Retrieve all network devices.
    """
    result = await db.execute(select(Device).offset(skip).limit(limit))
    devices = result.scalars().all()
    return devices

@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def add_device(device_in: DeviceCreate, db: AsyncSession = Depends(get_db)):
    """
    Add a new network device.
    """
    # Check if IP already exists
    result = await db.execute(select(Device).where(Device.ip_address == str(device_in.ip_address)))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="IP address already registered")
        
    device = Device(**device_in.model_dump())
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device
