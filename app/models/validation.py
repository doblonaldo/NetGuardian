from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Validation(Base):
    __tablename__ = "validations"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False, index=True)
    severity = Column(String, nullable=False) # CRITICAL, WARNING, INFO
    source = Column(String, nullable=False)   # device, netbox, librenms
    message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    device = relationship("Device", back_populates="validations")
