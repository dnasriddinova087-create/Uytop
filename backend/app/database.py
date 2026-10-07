import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("uytop.database")

# Engine configuration
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_initialized = False

def auto_seed_if_empty(db):
    try:
        from app.models.user import User, UserRole
        from app.models.property import Property, PropertyStatus, PropertyType, RentType
        from app.models.property_image import PropertyImage
        from app.models.amenity import PropertyAmenity, AmenityStatus
        from app.services.auth import get_password_hash

        # Check if users already exist
        if db.query(User).first() is not None:
            return

        # 1. Admin
        admin = User(
            first_name="Ulug'bek",
            last_name="Administrator",
            phone="+998901112233",
            email="admin@uytop.uz",
            hashed_password=get_password_hash("Admin123!"),
            role=UserRole.ADMIN.value,
            is_active=True,
            is_verified=True
        )
        db.add(admin)

        # 2. Makler 1
        makler1 = User(
            first_name="Rustam",
            last_name="Karimov",
            phone="+998909990011",
            email="rustam@makler.uz",
            hashed_password=get_password_hash("Makler123!"),
            role=UserRole.MAKLER.value,
            is_active=True,
            is_verified=True
        )
        db.add(makler1)

        # 3. Makler 2
        makler2 = User(
            first_name="Dilnoza",
            last_name="Alimova",
            phone="+998935554433",
            email="dilnoza@makler.uz",
            hashed_password=get_password_hash("Makler123!"),
            role=UserRole.MAKLER.value,
            is_active=True,
            is_verified=True
        )
        db.add(makler2)

        # 4. Mijoz (Client)
        mijoz1 = User(
            first_name="Jasur",
            last_name="Toirov",
            phone="+998971234567",
            email="jasur@mijoz.uz",
            hashed_password=get_password_hash("Mijoz123!"),
            role=UserRole.MIJOZ.value,
            is_active=True,
            is_verified=False
        )
        db.add(mijoz1)
        db.flush()

        # 5. Sample Properties
        sample_props = [
            {
                "owner_id": makler1.id,
                "title": "Chilonzorda zamonaviy ta'mirlangan 3 xonali shinam xonadon",
                "description": "Barcha qulayliklarga ega, metroga 5 daqiqalik masofada joylashgan shinam kvartira. Oilalar yoki talabalar uchun qulay. Wi-Fi, konditsioner, yangi muzlatgich va mebellar to'liq mavjud.",
                "property_type": PropertyType.APARTMENT.value,
                "rent_type": RentType.MONTHLY.value,
                "price": 6000000.0,
                "currency": "UZS",
                "deposit": 2000000.0,
                "utilities_included": False,
                "utilities_details": "Kommunal to'lovlar hisoblagich bo'yicha",
                "region": "Toshkent shahri",
                "city_district": "Chilonzor tumani",
                "mahalla": "Katta Chilonzor MFY",
                "address": "Chilonzor 9-mavze, 14-uy",
                "latitude": 41.2825,
                "longitude": 69.2045,
                "rooms": 3,
                "area_sqm": 78.5,
                "floor": 4,
                "total_floors": 9,
                "contact_phone": "+998909990011",
                "show_phone": True,
                "status": PropertyStatus.ACTIVE.value,
                "images": [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
                ],
                "amenities": {
                    "washing_machine": AmenityStatus.AVAILABLE,
                    "wifi": AmenityStatus.AVAILABLE,
                    "air_conditioning": AmenityStatus.AVAILABLE,
                    "refrigerator": AmenityStatus.AVAILABLE,
                    "tv": AmenityStatus.AVAILABLE,
                    "furniture": AmenityStatus.AVAILABLE,
                    "kitchen": AmenityStatus.AVAILABLE,
                    "elevator": AmenityStatus.AVAILABLE,
                    "parking": AmenityStatus.AVAILABLE,
                    "family_friendly": AmenityStatus.AVAILABLE,
                    "smoking_allowed": AmenityStatus.UNAVAILABLE,
                    "pets_allowed": AmenityStatus.UNAVAILABLE,
                }
            },
            {
                "owner_id": makler1.id,
                "title": "Yunusobod 4-mavzeda yangi bino (novostroyka) 2 xonali kvartira",
                "description": "Yangi qurilgan bino, evroremont. Uyda hech kim yashamagan. Barcha maishiy texnika kafolati bilan. Xavfsiz yopiq hovli, videokuzatuv va bolalar maydonchasi bor.",
                "property_type": PropertyType.APARTMENT.value,
                "rent_type": RentType.MONTHLY.value,
                "price": 7500000.0,
                "currency": "UZS",
                "deposit": 3000000.0,
                "utilities_included": True,
                "region": "Toshkent shahri",
                "city_district": "Yunusobod tumani",
                "mahalla": "Tiklanish MFY",
                "address": "Amir Temur shox ko'chasi 112",
                "latitude": 41.3650,
                "longitude": 69.2880,
                "rooms": 2,
                "area_sqm": 65.0,
                "floor": 6,
                "total_floors": 12,
                "contact_phone": "+998909990011",
                "show_phone": True,
                "status": PropertyStatus.ACTIVE.value,
                "images": [
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
                ],
                "amenities": {
                    "washing_machine": AmenityStatus.AVAILABLE,
                    "wifi": AmenityStatus.AVAILABLE,
                    "air_conditioning": AmenityStatus.AVAILABLE,
                    "refrigerator": AmenityStatus.AVAILABLE,
                    "tv": AmenityStatus.AVAILABLE,
                    "furniture": AmenityStatus.AVAILABLE,
                    "elevator": AmenityStatus.AVAILABLE,
                    "security_access": AmenityStatus.AVAILABLE,
                    "cctv": AmenityStatus.AVAILABLE,
                    "parking": AmenityStatus.AVAILABLE,
                }
            },
            {
                "owner_id": makler2.id,
                "title": "Samarqand markazida Registon yonida shinam hovli uy",
                "description": "Sayyohlar va oilalar uchun ajoyib maskan. Milliy uslubdagi mebellar, mevali bog' va yozgi oshxona mavjud. Registon maydoniga piyoda 7 daqiqa.",
                "property_type": PropertyType.HOUSE.value,
                "rent_type": RentType.DAILY.value,
                "price": 800000.0,
                "currency": "UZS",
                "deposit": 0.0,
                "utilities_included": True,
                "region": "Samarqand viloyati",
                "city_district": "Samarqand shahri",
                "mahalla": "Dahbed MFY",
                "address": "Registon ko'chasi 24",
                "latitude": 39.6548,
                "longitude": 66.9750,
                "rooms": 4,
                "area_sqm": 160.0,
                "floor": 1,
                "total_floors": 2,
                "contact_phone": "+998935554433",
                "show_phone": True,
                "status": PropertyStatus.ACTIVE.value,
                "images": [
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
                ],
                "amenities": {
                    "wifi": AmenityStatus.AVAILABLE,
                    "air_conditioning": AmenityStatus.AVAILABLE,
                    "refrigerator": AmenityStatus.AVAILABLE,
                    "kitchen": AmenityStatus.AVAILABLE,
                    "hot_water": AmenityStatus.AVAILABLE,
                    "cold_water": AmenityStatus.AVAILABLE,
                    "family_friendly": AmenityStatus.AVAILABLE,
                    "parking": AmenityStatus.AVAILABLE,
                }
            },
            {
                "owner_id": makler2.id,
                "title": "Mirobod tumanida premium klassdagi 1 xonali studio kvartira",
                "description": "Biznes markazlarga yaqin. Yuqori sifatli ta'mir, shinam interyer, konditsioner va to'liq oshxona anjomlari.",
                "property_type": PropertyType.STUDIO.value,
                "rent_type": RentType.MONTHLY.value,
                "price": 5500000.0,
                "currency": "UZS",
                "deposit": 2500000.0,
                "utilities_included": False,
                "region": "Toshkent shahri",
                "city_district": "Mirobod tumani",
                "mahalla": "Oybek MFY",
                "address": "Nukus ko'chasi 71",
                "latitude": 41.2910,
                "longitude": 69.2670,
                "rooms": 1,
                "area_sqm": 42.0,
                "floor": 8,
                "total_floors": 16,
                "contact_phone": "+998935554433",
                "show_phone": True,
                "status": PropertyStatus.ACTIVE.value,
                "images": [
                    "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=1200&q=80"
                ],
                "amenities": {
                    "washing_machine": AmenityStatus.AVAILABLE,
                    "wifi": AmenityStatus.AVAILABLE,
                    "air_conditioning": AmenityStatus.AVAILABLE,
                    "refrigerator": AmenityStatus.AVAILABLE,
                    "tv": AmenityStatus.AVAILABLE,
                    "elevator": AmenityStatus.AVAILABLE,
                    "security_access": AmenityStatus.AVAILABLE,
                }
            }
        ]

        for pdata in sample_props:
            imgs = pdata.pop("images")
            amenities = pdata.pop("amenities")
            prop = Property(**pdata)
            db.add(prop)
            db.flush()

            for idx, img_url in enumerate(imgs):
                p_img = PropertyImage(
                    property_id=prop.id,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    order_index=idx
                )
                db.add(p_img)

            prop_amenity = PropertyAmenity(
                property_id=prop.id,
                **amenities
            )
            db.add(prop_amenity)

        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Auto-seed skipped or failed: {e}")

def init_db():
    global _initialized
    import app.models  # Ensure models are imported
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if empty
    db = SessionLocal()
    try:
        auto_seed_if_empty(db)
    finally:
        db.close()
    _initialized = True

def ensure_db_ready():
    global _initialized
    if not _initialized:
        init_db()

def get_db():
    ensure_db_ready()
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
