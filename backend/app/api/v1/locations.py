from fastapi import APIRouter
from app.services.property_service import UZBEKISTAN_LOCATIONS

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("")
def get_locations():
    """Return all 14 regions of Uzbekistan with default coordinates and districts list."""
    formatted = []
    for region_name, data in UZBEKISTAN_LOCATIONS.items():
        formatted.append({
            "region": region_name,
            "latitude": data["lat"],
            "longitude": data["lon"],
            "districts": data["districts"]
        })
    return formatted
