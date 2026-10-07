from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class PropertyStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    RESERVED = "reserved"
    RENTED = "rented"
    HIDDEN = "hidden"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"      # Kvartira
    HOUSE = "house"              # Hovli
    ROOM = "room"                # Xona
    STUDIO = "studio"            # Studio
    COMMERCIAL = "commercial"    # Tijorat binosi

class RentType(str, enum.Enum):
    MONTHLY = "monthly"  # Oylik
    DAILY = "daily"      # Kunlik
    WEEKLY = "weekly"    # Haftalik

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    property_type = Column(String(50), default=PropertyType.APARTMENT.value, nullable=False, index=True)
    rent_type = Column(String(50), default=RentType.MONTHLY.value, nullable=False, index=True)
    price = Column(Float, nullable=False, index=True)
    currency = Column(String(10), default="UZS", nullable=False)
    deposit = Column(Float, default=0.0, nullable=False)
    utilities_included = Column(Boolean, default=False, nullable=False)
    utilities_details = Column(String(255), nullable=True)
    
    # Location
    region = Column(String(100), nullable=False, index=True)          # Viloyat
    city_district = Column(String(100), nullable=False, index=True)   # Shahar/Tuman
    mahalla = Column(String(100), nullable=True)                      # Mahalla
    address = Column(String(255), nullable=False)                     # Aniq manzil
    latitude = Column(Float, nullable=False, default=41.2995, index=True)
    longitude = Column(Float, nullable=False, default=69.2401, index=True)
    
    # Building / Layout
    rooms = Column(Integer, default=1, nullable=False, index=True)
    area_sqm = Column(Float, default=0.0, nullable=False)
    floor = Column(Integer, nullable=True)
    total_floors = Column(Integer, nullable=True)
    
    # Contact
    contact_phone = Column(String(30), nullable=True)
    show_phone = Column(Boolean, default=True, nullable=False)
    
    # Moderation & Lifecycle
    status = Column(String(30), default=PropertyStatus.ACTIVE.value, nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)
    views_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan", order_by="PropertyImage.order_index")
    amenity = relationship("PropertyAmenity", back_populates="property", uselist=False, cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="property", cascade="all, delete-orphan")
