from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.property import PropertyResponse

class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    property: PropertyResponse
    created_at: datetime
