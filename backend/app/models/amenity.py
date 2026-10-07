from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class AmenityStatus:
    AVAILABLE = "available"      # Mavjud
    UNAVAILABLE = "unavailable"  # Mavjud emas
    UNKNOWN = "unknown"          # Ma'lumot yo'q

class PropertyAmenity(Base):
    __tablename__ = "property_amenities"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # 30 standard amenities with tri-state ('available', 'unavailable', 'unknown')
    washing_machine = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    wifi = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    air_conditioning = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    refrigerator = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    tv = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    furniture = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    kitchen = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    shower = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    bath = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    hot_water = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    cold_water = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    gas = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    electricity = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    heating = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    ventilation = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    balcony = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    elevator = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    parking = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    security_access = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    cctv = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    cleaning_service = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    linens_towels = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    kitchen_utensils = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    pets_allowed = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    smoking_allowed = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    family_friendly = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    students_allowed = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    women_only = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    men_only = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)
    accessibility = Column(String(20), default=AmenityStatus.UNKNOWN, nullable=False)

    # Extensible field for additional custom amenities
    custom_amenities = Column(Text, nullable=True)

    property = relationship("Property", back_populates="amenity")
