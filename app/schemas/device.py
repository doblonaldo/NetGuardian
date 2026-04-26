from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DeviceBase(BaseModel):
    name: str
    ip_address: str = Field(..., description="IPv4 ou IPv6 address")
    vendor: str
    status: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    id: int
    last_seen: Optional[datetime] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
