from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User
from app.models.property import Property
from app.models.favorite import Favorite
from app.schemas.property import PropertyResponse
from app.api.deps import get_current_user
from app.api.v1.properties import _format_property_response

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[PropertyResponse])
def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).options(
        joinedload(Favorite.property).joinedload(Property.owner),
        joinedload(Favorite.property).joinedload(Property.images),
        joinedload(Favorite.property).joinedload(Property.amenity),
        joinedload(Favorite.property).joinedload(Property.favorites)
    ).order_by(Favorite.created_at.desc()).all()

    results = []
    for f in favs:
        if f.property:
            results.append(_format_property_response(f.property, current_user.id))
    return results

@router.post("/{property_id}")
def add_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id
    ).first()

    if not existing:
        fav = Favorite(user_id=current_user.id, property_id=property_id)
        db.add(fav)
        db.commit()

    return {"message": "Uy sevimlilarga saqlandi", "property_id": property_id, "is_favorited": True}

@router.delete("/{property_id}")
def remove_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()

    return {"message": "Uy sevimlilardan olib tashlandi", "property_id": property_id, "is_favorited": False}
