from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select

from app.core.database import get_db, AsyncSessionLocal
from app.models.device import Device
from app.models.validation import Validation
from app.schemas.device import DeviceCreate, DeviceResponse
from app.schemas.validation import ValidationResponse, ValidationGroupedResponse
from app.workers.tasks import run_collect_and_validate

router = APIRouter()

@router.get("/", response_model=List[DeviceResponse])
async def get_devices(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Retrieve all network devices.
    """
    result = await db.execute(select(Device).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{id}", response_model=DeviceResponse)
async def get_device(id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific network device by ID.
    """
    result = await db.execute(select(Device).where(Device.id == id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

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

@router.get("/{id}/validations", response_model=ValidationGroupedResponse)
async def get_device_validations(id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve and group all validations for a specific device.
    """
    # Verify if device exists
    result = await db.execute(select(Device).where(Device.id == id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    val_result = await db.execute(select(Validation).where(Validation.device_id == id))
    validations = val_result.scalars().all()

    grouped = {
        "device": device.name,
        "critical": [],
        "warning": [],
        "info": []
    }
    
    for val in validations:
        if val.severity.upper() == "CRITICAL":
            grouped["critical"].append(val)
        elif val.severity.upper() == "WARNING":
            grouped["warning"].append(val)
        else:
            grouped["info"].append(val)
            
    return grouped

@router.post("/{id}/collect", status_code=status.HTTP_202_ACCEPTED)
async def collect_device_data(id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """
    Aciona a rotina assíncrona (Pipeline) de extração, parse e auditoria em background.
    """
    result = await db.execute(select(Device).where(Device.id == id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    # Envelopa a execução para abrir uma nova conexão independente pro Worker
    async def task_wrapper(device_id: int):
        async with AsyncSessionLocal() as session:
            await run_collect_and_validate(device_id, session)

    background_tasks.add_task(task_wrapper, device.id)
    return {
        "message": "Pipeline de coleta e validação agendado com sucesso.",
        "device_id": id
    }
