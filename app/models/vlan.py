from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Vlan(Base):
    __tablename__ = "vlans"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    vlan_id = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=True)

    # Relationships
    device = relationship("Device", back_populates="vlans")
