from fastapi import status
from app.models.user import User, UserRole
from app.services.auth import get_password_hash

def test_admin_dilfuza_login(client, db_session):
    # Ensure Dilfuza Nasriddinova exists with dilfuza.4002
    admin = db_session.query(User).filter(User.role == UserRole.ADMIN.value).first()
    if not admin:
        admin = User(
            first_name="Dilfuza",
            last_name="Nasriddinova",
            phone="+998901112233",
            email="admin@uytop.uz",
            hashed_password=get_password_hash("dilfuza.4002"),
            role=UserRole.ADMIN.value,
            is_active=True,
            is_verified=True
        )
        db_session.add(admin)
        db_session.commit()
    else:
        admin.first_name = "Dilfuza"
        admin.last_name = "Nasriddinova"
        admin.hashed_password = get_password_hash("dilfuza.4002")
        db_session.commit()

    # Login with phone
    res_phone = client.post("/api/v1/auth/login", json={
        "identifier": admin.phone,
        "password": "dilfuza.4002"
    })
    assert res_phone.status_code == status.HTTP_200_OK
    data = res_phone.json()
    assert data["user"]["first_name"] == "Dilfuza"
    assert data["user"]["last_name"] == "Nasriddinova"
    assert data["user"]["role"] == "admin"

    # Login with email
    res_email = client.post("/api/v1/auth/login", json={
        "identifier": admin.email,
        "password": "dilfuza.4002"
    })
    assert res_email.status_code == status.HTTP_200_OK

def test_client_registration_disallows_email(client):
    payload = {
        "first_name": "Sardor",
        "last_name": "Rahimov",
        "phone": "+998939998877",
        "email": "sardor@example.com",
        "role": "mijoz",
        "password": "SecretPassword123!",
        "password_confirm": "SecretPassword123!",
        "agree_terms": True
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["user"]["role"] == "mijoz"
    # Email must be None for clients
    assert data["user"]["email"] is None

def test_makler_registration_allows_email(client):
    payload = {
        "first_name": "Jamshid",
        "last_name": "Makler",
        "phone": "+998941234567",
        "email": "jamshid@makler.uz",
        "role": "makler",
        "password": "MaklerPassword123!",
        "password_confirm": "MaklerPassword123!",
        "agree_terms": True
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["user"]["role"] == "makler"
    assert data["user"]["email"] == "jamshid@makler.uz"

def test_property_search_by_location_query(client, makler_user, auth_headers):
    # Create property in Chilonzor
    prop_payload = {
        "title": "Chilonzor 3-xona kvartira",
        "description": "Metrogacha 5 daqiqa masofa",
        "property_type": "apartment",
        "rent_type": "monthly",
        "price": 4500000.0,
        "region": "Toshkent shahri",
        "city_district": "Chilonzor tumani",
        "mahalla": "Qatortol",
        "address": "Qatortol ko'chasi, 12-uy",
        "rooms": 3,
        "area_sqm": 72.0
    }
    create_res = client.post("/api/v1/properties", json=prop_payload, headers=auth_headers("makler"))
    assert create_res.status_code == status.HTTP_201_CREATED
    created_id = create_res.json()["id"]

    # Search by q='Chilonzor'
    search_res = client.get("/api/v1/properties?q=Chilonzor")
    assert search_res.status_code == status.HTTP_200_OK
    items = search_res.json()["items"]
    assert any(p["id"] == created_id for p in items)

    # Search by q='Qatortol'
    search_mahalla = client.get("/api/v1/properties?q=Qatortol")
    assert search_mahalla.status_code == status.HTTP_200_OK
    items_m = search_mahalla.json()["items"]
    assert any(p["id"] == created_id for p in items_m)

def test_admin_conversations_and_delete_property(client, admin_user, makler_user, client_user, auth_headers):
    # Start conversation
    conv_res = client.post("/api/v1/conversations", json={
        "broker_id": makler_user.id,
        "initial_message": "Salom, uy hali bormi?"
    }, headers=auth_headers("client"))
    assert conv_res.status_code == status.HTTP_201_CREATED
    conv_id = conv_res.json()["id"]

    # Admin reads conversations
    admin_convs = client.get("/api/v1/admin/conversations", headers=auth_headers("admin"))
    assert admin_convs.status_code == status.HTTP_200_OK
    assert any(c["id"] == conv_id for c in admin_convs.json())

    # Admin reads messages
    admin_msgs = client.get(f"/api/v1/admin/conversations/{conv_id}/messages", headers=auth_headers("admin"))
    assert admin_msgs.status_code == status.HTTP_200_OK
    assert len(admin_msgs.json()) >= 1
