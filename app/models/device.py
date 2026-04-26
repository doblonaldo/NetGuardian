from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    vendor = Column(String, nullable=False)
    status = Column(String, nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    interfaces = relationship("Interface", back_populates="device", cascade="all, delete-orphan")
    ip_addresses = relationship("IPAddress", back_populates="device", cascade="all, delete-orphan")
    vlans = relationship("Vlan", back_populates="device", cascade="all, delete-orphan")
    validations = relationship("Validation", back_populates="device", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="device", cascade="all, delete-orphan")
