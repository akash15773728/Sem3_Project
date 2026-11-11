from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, ForeignKey, UniqueConstraint, Text, Float
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class District(Base):
    __tablename__ = "districts"

    district_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    district_name = Column(String(100), nullable=False)
    state_name = Column(String(100), nullable=False, default="Delhi NCR")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("district_name", "state_name", name="uq_district_name_state"),
    )

    facilities = relationship("Facility", back_populates="district", cascade="all, delete-orphan")
    users = relationship("User", back_populates="district")


class Facility(Base):
    __tablename__ = "facilities"

    facility_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    facility_name = Column(String(200), nullable=False)
    facility_type = Column(String(50), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.district_id", ondelete="RESTRICT"), nullable=False, index=True)
    contact_phone = Column(String(20), nullable=True)
    address = Column(String(300), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    district = relationship("District", back_populates="facilities")
    users = relationship("User", back_populates="facility")
    capacities = relationship("FacilityCapacity", back_populates="facility", cascade="all, delete-orphan")
    outbound_referrals = relationship("Referral", foreign_keys="Referral.source_facility_id", back_populates="source_facility")
    inbound_referrals = relationship("Referral", foreign_keys="Referral.destination_facility_id", back_populates="destination_facility")


class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    service_name = Column(String(150), nullable=False, unique=True, index=True)
    category = Column(String(50), nullable=False)
    description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    capacities = relationship("FacilityCapacity", back_populates="service", cascade="all, delete-orphan")
    referrals = relationship("Referral", back_populates="service")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False) # 'Facility Staff', 'District Officer', 'State Officer', 'National Officer', 'Administrator'
    facility_id = Column(Integer, ForeignKey("facilities.facility_id", ondelete="SET NULL"), nullable=True)
    district_id = Column(Integer, ForeignKey("districts.district_id", ondelete="SET NULL"), nullable=True)
    state_name = Column(String(100), nullable=True) # For State Officer scoping
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    facility = relationship("Facility", back_populates="users")
    district = relationship("District", back_populates="users")
    created_referrals = relationship("Referral", back_populates="creator")
    activity_logs = relationship("ActivityLog", back_populates="user")


class FacilityCapacity(Base):
    __tablename__ = "facility_capacity"

    capacity_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    facility_id = Column(Integer, ForeignKey("facilities.facility_id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="CASCADE"), nullable=False, index=True)
    service_available = Column(Boolean, default=True, nullable=False)
    specialist_count = Column(Integer, default=0, nullable=False)
    equipment_available = Column(Boolean, default=True, nullable=False)
    beds_available = Column(Integer, default=0, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("facility_id", "service_id", name="uq_facility_service_capacity"),
    )

    facility = relationship("Facility", back_populates="capacities")
    service = relationship("Service", back_populates="capacities")


class Referral(Base):
    __tablename__ = "referrals"

    referral_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_facility_id = Column(Integer, ForeignKey("facilities.facility_id"), nullable=False, index=True)
    destination_facility_id = Column(Integer, ForeignKey("facilities.facility_id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    referral_date = Column(Date, default=date.today, nullable=False, index=True)
    
    # Structured shortage tracking
    reason_category = Column(String(50), default="Equipment Unavailable", nullable=False) # 'Specialist Unavailable', 'Equipment Unavailable', 'Diagnostic Service Unavailable', 'Insufficient Beds', 'Other'
    unavailable_resource = Column(String(100), nullable=True) # e.g. 'Echocardiogram', 'Cardiologist', 'CT Scanner', 'ICU Beds'
    
    reason = Column(String(500), nullable=False)
    status = Column(String(30), default="Pending", nullable=False, index=True)
    priority = Column(String(20), default="Routine", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    source_facility = relationship("Facility", foreign_keys=[source_facility_id], back_populates="outbound_referrals")
    destination_facility = relationship("Facility", foreign_keys=[destination_facility_id], back_populates="inbound_referrals")
    service = relationship("Service", back_populates="referrals")
    creator = relationship("User", back_populates="created_referrals")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    log_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    action = Column(String(300), nullable=False)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="activity_logs")
