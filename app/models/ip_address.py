from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class IPAddress(Base):
    __tablename__ = "ip_addresses"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    interface_id = Column(Integer, ForeignKey("interfaces.id", ondelete="CASCADE"), nullable=True)
    address = Column(String, nullable=False, index=True)
    netmask = Column(String, nullable=False)

    # Relationships
    device = relationship("Device", back_populates="ip_addresses")
    interface = relationship("Interface", back_populates="ip_addresses")
