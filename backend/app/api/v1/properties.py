from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User, UserRole
from app.models.property import Property, PropertyStatus
from app.models.property_image import PropertyImage
from app.models.amenity import PropertyAmenity, AmenityStatus
from app.models.favorite import Favorite
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertyListResponse,
    PropertyImageResponse,
    AmenitySchema,
)
from app.api.deps import get_current_user, get_optional_current_user, require_makler
from app.services.file_upload import save_uploaded_image, delete_uploaded_image
from app.services.property_service import calculate_haversine_distance
from app.services.audit import log_audit

router = APIRouter(prefix="/properties", tags=["Properties"])

def _format_property_response(prop: Property, current_user_id: Optional[int] = None, distance_km: Optional[float] = None) -> PropertyResponse:
    # Check if favorited
    is_fav = False
    if current_user_id and prop.favorites:
        is_fav = any(f.user_id == current_user_id for f in prop.favorites)
    
    amenity_data = None
    if prop.amenity:
        amenity_data = AmenitySchema.model_validate(prop.amenity)
    
    images_data = [
        PropertyImageResponse(
            id=img.id,
            image_url=img.image_url,
            is_primary=img.is_primary,
            order_index=img.order_index
        )
        for img in prop.images
    ]
    
    res = PropertyResponse(
        id=prop.id,
        owner_id=prop.owner_id,
        owner=prop.owner,
        title=prop.title,
        description=prop.description,
        property_type=prop.property_type,
        rent_type=prop.rent_type,
        price=prop.price,
        currency=prop.currency,
        deposit=prop.deposit,
        utilities_included=prop.utilities_included,
        utilities_details=prop.utilities_details,
        region=prop.region,
        city_district=prop.city_district,
        mahalla=prop.mahalla,
        address=prop.address,
        latitude=prop.latitude,
        longitude=prop.longitude,
        rooms=prop.rooms,
        area_sqm=prop.area_sqm,
        floor=prop.floor,
        total_floors=prop.total_floors,
        contact_phone=prop.contact_phone if prop.show_phone else None,
        show_phone=prop.show_phone,
        status=prop.status,
        rejection_reason=prop.rejection_reason,
        views_count=prop.views_count,
        images=images_data,
        amenity=amenity_data,
        is_favorited=is_fav,
        distance_km=distance_km,
        created_at=prop.created_at,
        updated_at=prop.updated_at
    )
    return res

@router.get("", response_model=PropertyListResponse)
def get_properties(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    q: Optional[str] = None,
    region: Optional[str] = None,
    city_district: Optional[str] = None,
    mahalla: Optional[str] = None,
    price_min: Optional[float] = Query(None, ge=0),
    price_max: Optional[float] = Query(None, ge=0),
    property_type: Optional[str] = None,
    rent_type: Optional[str] = None,
    rooms: Optional[int] = Query(None, ge=1),
    floor: Optional[int] = None,
    utilities_included: Optional[bool] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    owner_id: Optional[int] = None,
    # Amenity filters
    wifi: Optional[str] = None,
    washing_machine: Optional[str] = None,
    air_conditioning: Optional[str] = None,
    refrigerator: Optional[str] = None,
    elevator: Optional[str] = None,
    parking: Optional[str] = None,
    pets_allowed: Optional[str] = None,
    family_friendly: Optional[str] = None,
    sort_by: str = Query("newest", pattern="^(newest|cheapest|expensive|views)$"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Property).options(
        joinedload(Property.owner),
        joinedload(Property.images),
        joinedload(Property.amenity),
        joinedload(Property.favorites)
    )

    # Filter status: default to 'active' for general public search, unless owner or admin views specific
    if status_filter:
        query = query.filter(Property.status == status_filter)
    else:
        if not owner_id:
            query = query.filter(Property.status == PropertyStatus.ACTIVE.value)

    if owner_id:
        query = query.filter(Property.owner_id == owner_id)

    if q:
        q_term = f"%{q.strip()}%"
        query = query.filter(
            (Property.title.ilike(q_term)) |
            (Property.description.ilike(q_term)) |
            (Property.region.ilike(q_term)) |
            (Property.city_district.ilike(q_term)) |
            (Property.mahalla.ilike(q_term)) |
            (Property.address.ilike(q_term))
        )

    if region:
        query = query.filter(Property.region.ilike(f"%{region}%"))
    if city_district:
        query = query.filter(Property.city_district.ilike(f"%{city_district}%"))
    if mahalla:
        query = query.filter(Property.mahalla.ilike(f"%{mahalla}%"))
    if price_min is not None:
        query = query.filter(Property.price >= price_min)
    if price_max is not None:
        query = query.filter(Property.price <= price_max)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if rent_type:
        query = query.filter(Property.rent_type == rent_type)
    if rooms is not None:
        query = query.filter(Property.rooms == rooms)
    if floor is not None:
        query = query.filter(Property.floor == floor)
    if utilities_included is not None:
        query = query.filter(Property.utilities_included == utilities_included)

    # Amenity filters (joining PropertyAmenity if needed)
    amenity_conditions = []
    if any([wifi, washing_machine, air_conditioning, refrigerator, elevator, parking, pets_allowed, family_friendly]):
        query = query.join(PropertyAmenity, Property.id == PropertyAmenity.property_id)
        if wifi:
            query = query.filter(PropertyAmenity.wifi == wifi)
        if washing_machine:
            query = query.filter(PropertyAmenity.washing_machine == washing_machine)
        if air_conditioning:
            query = query.filter(PropertyAmenity.air_conditioning == air_conditioning)
        if refrigerator:
            query = query.filter(PropertyAmenity.refrigerator == refrigerator)
        if elevator:
            query = query.filter(PropertyAmenity.elevator == elevator)
        if parking:
            query = query.filter(PropertyAmenity.parking == parking)
        if pets_allowed:
            query = query.filter(PropertyAmenity.pets_allowed == pets_allowed)
        if family_friendly:
            query = query.filter(PropertyAmenity.family_friendly == family_friendly)

    # Sorting
    if sort_by == "cheapest":
        query = query.order_by(Property.price.asc())
    elif sort_by == "expensive":
        query = query.order_by(Property.price.desc())
    elif sort_by == "views":
        query = query.order_by(Property.views_count.desc())
    else:  # newest
        query = query.order_by(Property.created_at.desc())

    total = query.count()
    items_raw = query.offset((page - 1) * page_size).limit(page_size).all()
    
    current_uid = current_user.id if current_user else None
    items = [_format_property_response(p, current_uid) for p in items_raw]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PropertyListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/nearby", response_model=List[PropertyResponse])
def get_nearby_properties(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(10.0, ge=0.5, le=100.0),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Fetch active properties and compute distance
    active_props = db.query(Property).filter(
        Property.status == PropertyStatus.ACTIVE.value
    ).options(
        joinedload(Property.owner),
        joinedload(Property.images),
        joinedload(Property.amenity),
        joinedload(Property.favorites)
    ).all()

    nearby = []
    current_uid = current_user.id if current_user else None

    for prop in active_props:
        dist = calculate_haversine_distance(lat, lon, prop.latitude, prop.longitude)
        if dist <= radius_km:
            formatted = _format_property_response(prop, current_uid, distance_km=dist)
            nearby.append((dist, formatted))

    # Sort by nearest
    nearby.sort(key=lambda x: x[0])
    return [item[1] for item in nearby[:30]]

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).options(
        joinedload(Property.owner),
        joinedload(Property.images),
        joinedload(Property.amenity),
        joinedload(Property.favorites)
    ).first()

    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uy e'loni topilmadi"
        )

    # Increment views count
    prop.views_count += 1
    db.commit()

    if current_user:
        try:
            log_audit(
                db,
                action="PROPERTY_VIEW",
                entity_type="property",
                user_id=current_user.id,
                entity_id=prop.id,
                details={"title": prop.title, "price": prop.price, "currency": prop.currency}
            )
        except Exception:
            pass

    current_uid = current_user.id if current_user else None
    return _format_property_response(prop, current_uid)

@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    prop_in: PropertyCreate,
    current_user: User = Depends(require_makler),
    db: Session = Depends(get_db)
):
    # Create Property instance
    new_prop = Property(
        owner_id=current_user.id,
        title=prop_in.title.strip(),
        description=prop_in.description,
        property_type=prop_in.property_type,
        rent_type=prop_in.rent_type,
        price=prop_in.price,
        currency=prop_in.currency,
        deposit=prop_in.deposit,
        utilities_included=prop_in.utilities_included,
        utilities_details=prop_in.utilities_details,
        region=prop_in.region.strip(),
        city_district=prop_in.city_district.strip(),
        mahalla=prop_in.mahalla.strip() if prop_in.mahalla else None,
        address=prop_in.address.strip(),
        latitude=prop_in.latitude,
        longitude=prop_in.longitude,
        rooms=prop_in.rooms,
        area_sqm=prop_in.area_sqm,
        floor=prop_in.floor,
        total_floors=prop_in.total_floors,
        contact_phone=prop_in.contact_phone.strip() if prop_in.contact_phone else current_user.phone,
        show_phone=prop_in.show_phone,
        status=PropertyStatus.ACTIVE.value
    )
    db.add(new_prop)
    db.flush()  # get new_prop.id

    # Create Amenities
    amenity_dict = prop_in.amenities.model_dump() if prop_in.amenities else {}
    new_amenity = PropertyAmenity(
        property_id=new_prop.id,
        **amenity_dict
    )
    db.add(new_amenity)
    db.commit()
    db.refresh(new_prop)

    log_audit(
        db,
        action="PROPERTY_CREATE",
        entity_type="property",
        user_id=current_user.id,
        entity_id=new_prop.id,
        details={"title": new_prop.title, "price": new_prop.price}
    )

    return _format_property_response(new_prop, current_user.id)

@router.patch("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    prop_update: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uy e'loni topilmadi"
        )
    
    # Ownership or admin check
    if prop.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faqat o'zingizga tegishli e'lonni tahrirlashingiz mumkin"
        )

    update_data = prop_update.model_dump(exclude_unset=True)
    amenity_data = update_data.pop("amenities", None)

    for field, val in update_data.items():
        setattr(prop, field, val)

    if amenity_data is not None:
        if prop.amenity:
            for k, v in amenity_data.items():
                setattr(prop.amenity, k, v)
        else:
            new_amenity = PropertyAmenity(property_id=prop.id, **amenity_data)
            db.add(new_amenity)

    db.commit()
    db.refresh(prop)

    log_audit(
        db,
        action="PROPERTY_UPDATE",
        entity_type="property",
        user_id=current_user.id,
        entity_id=prop.id,
        details={"updated_fields": list(update_data.keys())}
    )

    return _format_property_response(prop, current_user.id)

@router.post("/{property_id}/rent", response_model=PropertyResponse)
def mark_property_as_rented(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")
    if prop.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")
    
    prop.status = PropertyStatus.RENTED.value
    db.commit()
    db.refresh(prop)
    
    log_audit(db, "PROPERTY_RENTED", "property", current_user.id, prop.id)
    return _format_property_response(prop, current_user.id)

@router.post("/{property_id}/close", response_model=PropertyResponse)
def close_property(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")
    if prop.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")
    
    prop.status = PropertyStatus.HIDDEN.value
    db.commit()
    db.refresh(prop)
    
    log_audit(db, "PROPERTY_HIDE", "property", current_user.id, prop.id)
    return _format_property_response(prop, current_user.id)

@router.post("/{property_id}/reopen", response_model=PropertyResponse)
def reopen_property(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")
    if prop.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")
    
    prop.status = PropertyStatus.ACTIVE.value
    db.commit()
    db.refresh(prop)
    
    log_audit(db, "PROPERTY_REOPEN", "property", current_user.id, prop.id)
    return _format_property_response(prop, current_user.id)

@router.delete("/{property_id}")
def archive_or_delete_property(
    property_id: int,
    permanent: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")
    if prop.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")
    
    if permanent or current_user.role == UserRole.ADMIN.value:
        db.delete(prop)
        db.commit()
        log_audit(db, "PROPERTY_DELETE", "property", current_user.id, property_id)
        return {"message": "E'lon tizimdan butunlay o'chirildi"}
    else:
        prop.status = PropertyStatus.ARCHIVED.value
        db.commit()
        log_audit(db, "PROPERTY_ARCHIVE", "property", current_user.id, prop.id)
        return {"message": "E'lon arxivlandi"}

@router.post("/{property_id}/images", response_model=List[PropertyImageResponse])
def upload_property_images(
    property_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")
    if prop.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Faqat o'z e'loningizga rasm yuklashingiz mumkin")

    saved_images = []
    current_count = db.query(PropertyImage).filter(PropertyImage.property_id == property_id).count()

    for idx, f in enumerate(files):
        url = save_uploaded_image(f)
        is_first = (current_count == 0 and idx == 0)
        img = PropertyImage(
            property_id=property_id,
            image_url=url,
            is_primary=is_first,
            order_index=current_count + idx
        )
        db.add(img)
        saved_images.append(img)

    db.commit()
    for img in saved_images:
        db.refresh(img)

    log_audit(
        db,
        action="PROPERTY_IMAGES_UPLOAD",
        entity_type="property",
        user_id=current_user.id,
        entity_id=prop.id,
        details={"count": len(files)}
    )

    return [PropertyImageResponse.model_validate(img) for img in saved_images]

@router.delete("/{property_id}/images/{image_id}")
def delete_property_image(
    property_id: int,
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")
    if prop.owner_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")

    img = db.query(PropertyImage).filter(
        PropertyImage.id == image_id,
        PropertyImage.property_id == property_id
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Rasm topilmadi")

    delete_uploaded_image(img.image_url)
    db.delete(img)
    db.commit()

    return {"message": "Rasm o'chirildi"}
