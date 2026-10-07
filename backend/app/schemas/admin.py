from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse

class AdminDashboardStats(BaseModel):
    total_users: int
    active_clients: int
    active_brokers: int
    total_properties: int
    active_properties: int
    rented_properties: int
    pending_properties: int
    blocked_users: int
    total_reports: int
    pending_reports: int

class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[str] = None

class AdminPropertyModerate(BaseModel):
    status: str  # active, rejected, hidden, archived
    rejection_reason: Optional[str] = None

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    user: Optional[UserResponse] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

class AuditLogListResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int
