from pydantic import BaseModel, Field
from typing import Optional

class DeviceBase(BaseModel):
    hostname: str
    ip_address: str = Field(..., description="IPv4 or IPv6 address")
    vendor: str
    os_version: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    id: int

    model_config = {
        "from_attributes": True
    }
