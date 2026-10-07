from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse

class ReportCreate(BaseModel):
    property_id: int
    reason: str = Field(..., min_length=3, max_length=100)
    details: Optional[str] = None

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reporter_id: int
    reporter: Optional[UserResponse] = None
    property_id: int
    reason: str
    details: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime

class ReportUpdate(BaseModel):
    status: str = Field(..., description="reviewed, dismissed, resolved")
    admin_notes: Optional[str] = None
