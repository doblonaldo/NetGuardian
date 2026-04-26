from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, index=True, nullable=False)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    vendor = Column(String, nullable=False)  # e.g., cisco_ios, juniper_junos
    os_version = Column(String, nullable=True)
