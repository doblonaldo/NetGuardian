from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ValidationBase(BaseModel):
    device_id: int
    type: str
    severity: str
    source: str
    message: str

class ValidationCreate(ValidationBase):
    pass

class ValidationResponse(ValidationBase):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class ValidationGroupedResponse(BaseModel):
    device: str
    critical: List[ValidationResponse]
    warning: List[ValidationResponse]
    info: List[ValidationResponse]
