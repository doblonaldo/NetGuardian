from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Interface(Base):
    __tablename__ = "interfaces"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, index=True)
    status = Column(String, nullable=True)
    description = Column(String, nullable=True)

    # Relationships
    device = relationship("Device", back_populates="interfaces")
    ip_addresses = relationship("IPAddress", back_populates="interface", cascade="all, delete-orphan")
