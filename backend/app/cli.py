import sys
import argparse
from app.database import SessionLocal, init_db
from app.models.user import User, UserRole
from app.models.property import Property, PropertyStatus, PropertyType, RentType
from app.models.property_image import PropertyImage
from app.models.amenity import PropertyAmenity, AmenityStatus
from app.services.auth import get_password_hash

def create_admin(first_name: str, last_name: str, phone: str, password: str, email: str = None):
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.phone == phone).first()
        if existing:
            print(f"Foydalanuvchi ({phone}) allaqachon mavjud. Rol admin ga o'zgartirilmoqda...")
            existing.role = UserRole.ADMIN.value
            existing.hashed_password = get_password_hash(password)
            existing.is_active = True
            existing.is_verified = True
            db.commit()
            print("Admin akkaunti yangilandi!")
            return

        admin_user = User(
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN.value,
            is_active=True,
            is_verified=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin akkaunti muvaffaqiyatli yaratildi! ID: {admin_user.id}, Telefon: {phone}")
    finally:
        db.close()

def seed_demo_data():
    init_db()
    db = SessionLocal()
    try:
        # 1. Admin
        admin = db.query(User).filter(User.phone == "+998901112233").first()
        if not admin:
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
            db.commit()
            db.refresh(admin)

        # 2. Makler 1
        makler1 = db.query(User).filter(User.phone == "+998909990011").first()
        if not makler1:
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
            db.commit()
            db.refresh(makler1)

        # 3. Makler 2
        makler2 = db.query(User).filter(User.phone == "+998935554433").first()
        if not makler2:
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
            db.commit()
            db.refresh(makler2)

        # 4. Mijoz (Client)
        mijoz1 = db.query(User).filter(User.phone == "+998971234567").first()
        if not mijoz1:
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
            db.commit()
            db.refresh(mijoz1)

        # 5. Sample Properties
        if db.query(Property).count() == 0:
            sample_properties = [
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

            for pdata in sample_properties:
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
            print("Namunaviy uylar muvaffaqiyatli bazaga qo'shildi!")

        print("Namunaviy ma'lumotlar tayyor!")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="UyTop CLI vositasi")
    subparsers = parser.add_subparsers(dest="command")

    # init-db
    subparsers.add_parser("init-db", help="Ma'lumotlar bazasi jadvallarini yaratish")

    # seed
    subparsers.add_parser("seed", help="Namunaviy ma'lumotlarni bazaga yozish")

    # create-admin
    admin_parser = subparsers.add_parser("create-admin", help="Yangi admin akkauntini yaratish")
    admin_parser.add_argument("--first-name", required=True)
    admin_parser.add_argument("--last-name", required=True)
    admin_parser.add_argument("--phone", required=True)
    admin_parser.add_argument("--password", required=True)
    admin_parser.add_argument("--email", default=None)

    args = parser.parse_args()

    if args.command == "init-db":
        init_db()
        print("Ma'lumotlar bazasi jadvallari yaratildi!")
    elif args.command == "seed":
        seed_demo_data()
    elif args.command == "create-admin":
        create_admin(
            first_name=args.first_name,
            last_name=args.last_name,
            phone=args.phone,
            password=args.password,
            email=args.email
        )
    else:
        parser.print_help()
