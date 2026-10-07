from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse

class AmenitySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    washing_machine: str = Field(default="unknown")
    wifi: str = Field(default="unknown")
    air_conditioning: str = Field(default="unknown")
    refrigerator: str = Field(default="unknown")
    tv: str = Field(default="unknown")
    furniture: str = Field(default="unknown")
    kitchen: str = Field(default="unknown")
    shower: str = Field(default="unknown")
    bath: str = Field(default="unknown")
    hot_water: str = Field(default="unknown")
    cold_water: str = Field(default="unknown")
    gas: str = Field(default="unknown")
    electricity: str = Field(default="unknown")
    heating: str = Field(default="unknown")
    ventilation: str = Field(default="unknown")
    balcony: str = Field(default="unknown")
    elevator: str = Field(default="unknown")
    parking: str = Field(default="unknown")
    security_access: str = Field(default="unknown")
    cctv: str = Field(default="unknown")
    cleaning_service: str = Field(default="unknown")
    linens_towels: str = Field(default="unknown")
    kitchen_utensils: str = Field(default="unknown")
    pets_allowed: str = Field(default="unknown")
    smoking_allowed: str = Field(default="unknown")
    family_friendly: str = Field(default="unknown")
    students_allowed: str = Field(default="unknown")
    women_only: str = Field(default="unknown")
    men_only: str = Field(default="unknown")
    accessibility: str = Field(default="unknown")
    custom_amenities: Optional[str] = None

class PropertyImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    is_primary: bool
    order_index: int

class PropertyCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    property_type: str = Field(default="apartment")
    rent_type: str = Field(default="monthly")
    price: float = Field(..., gt=0)
    currency: str = Field(default="UZS")
    deposit: float = Field(default=0.0, ge=0)
    utilities_included: bool = Field(default=False)
    utilities_details: Optional[str] = None
    
    region: str = Field(..., min_length=2)
    city_district: str = Field(..., min_length=2)
    mahalla: Optional[str] = None
    address: str = Field(..., min_length=2)
    latitude: float = Field(default=41.2995)
    longitude: float = Field(default=69.2401)
    
    rooms: int = Field(default=1, ge=1)
    area_sqm: float = Field(..., gt=0)
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    contact_phone: Optional[str] = None
    show_phone: bool = Field(default=True)
    
    amenities: Optional[AmenitySchema] = None

class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    property_type: Optional[str] = None
    rent_type: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    deposit: Optional[float] = Field(None, ge=0)
    utilities_included: Optional[bool] = None
    utilities_details: Optional[str] = None
    
    region: Optional[str] = None
    city_district: Optional[str] = None
    mahalla: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    rooms: Optional[int] = Field(None, ge=1)
    area_sqm: Optional[float] = Field(None, gt=0)
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    contact_phone: Optional[str] = None
    show_phone: Optional[bool] = None
    
    amenities: Optional[AmenitySchema] = None

class PropertyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    owner: Optional[UserResponse] = None
    title: str
    description: Optional[str] = None
    property_type: str
    rent_type: str
    price: float
    currency: str
    deposit: float
    utilities_included: bool
    utilities_details: Optional[str] = None
    
    region: str
    city_district: str
    mahalla: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    
    rooms: int
    area_sqm: float
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    contact_phone: Optional[str] = None
    show_phone: bool
    
    status: str
    rejection_reason: Optional[str] = None
    views_count: int
    
    images: List[PropertyImageResponse] = []
    amenity: Optional[AmenitySchema] = None
    is_favorited: Optional[bool] = False
    distance_km: Optional[float] = None
    
    created_at: datetime
    updated_at: datetime

class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
