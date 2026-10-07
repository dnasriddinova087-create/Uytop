from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse

class MessageCreate(BaseModel):
    text: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: int
    text: str
    is_read: bool
    created_at: datetime

class ConversationCreate(BaseModel):
    broker_id: int
    property_id: Optional[int] = None
    initial_message: Optional[str] = None

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    broker_id: int
    property_id: Optional[int] = None
    client: Optional[UserResponse] = None
    broker: Optional[UserResponse] = None
    property: Optional[PropertyResponse] = None
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime
