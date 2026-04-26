from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.device import Device
from app.models.validation import Validation
from app.schemas.validation import ValidationGroupedResponse

router = APIRouter()

@router.get("/", response_model=List[ValidationGroupedResponse])
async def get_validations(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Retrieve all validation results across all devices, grouped by device and severity.
    """
    # Busca os dispositivos e injeta as validações em uma única Query (Eager Loading)
    result = await db.execute(
        select(Device).options(selectinload(Device.validations)).offset(skip).limit(limit)
    )
    devices = result.scalars().all()
    
    response = []
    for device in devices:
        if not device.validations:
            continue
            
        grouped = {
            "device": device.name,
            "critical": [v for v in device.validations if v.severity.upper() == "CRITICAL"],
            "warning":  [v for v in device.validations if v.severity.upper() == "WARNING"],
            "info":     [v for v in device.validations if v.severity.upper() not in ("CRITICAL", "WARNING")]
        }
        response.append(grouped)
        
    return response
