from fastapi import status

def test_makler_create_property(client, auth_headers):
    payload = {
        "title": "Chilonzor 3 xonali uy",
        "description": "To'liq mebellar bilan jihozlangan shinam xonadon",
        "property_type": "apartment",
        "rent_type": "monthly",
        "price": 5000000.0,
        "currency": "UZS",
        "deposit": 1000000.0,
        "utilities_included": False,
        "region": "Toshkent shahri",
        "city_district": "Chilonzor tumani",
        "mahalla": "Navro'z MFY",
        "address": "Lutfiy ko'chasi 12",
        "latitude": 41.2850,
        "longitude": 69.2100,
        "rooms": 3,
        "area_sqm": 72.0,
        "floor": 3,
        "total_floors": 9,
        "show_phone": True,
        "amenities": {
            "wifi": "available",
            "washing_machine": "available",
            "air_conditioning": "available",
            "refrigerator": "available",
            "elevator": "available",
            "parking": "unavailable",
            "pets_allowed": "unknown"
        }
    }
    response = client.post("/api/v1/properties", json=payload, headers=auth_headers("makler"))
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Chilonzor 3 xonali uy"
    assert data["status"] == "active"
    assert data["amenity"]["wifi"] == "available"
    assert data["amenity"]["elevator"] == "available"
    assert data["amenity"]["parking"] == "unavailable"
    assert data["amenity"]["pets_allowed"] == "unknown"

def test_client_cannot_create_property(client, auth_headers):
    payload = {
        "title": "Ruxsatsiz e'lon",
        "property_type": "apartment",
        "rent_type": "monthly",
        "price": 2000000.0,
        "region": "Toshkent shahri",
        "city_district": "Yunusobod",
        "address": "Test",
        "latitude": 41.3,
        "longitude": 69.2,
        "rooms": 1,
        "area_sqm": 40.0
    }
    response = client.post("/api/v1/properties", json=payload, headers=auth_headers("client"))
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_property_lifecycle_and_ownership(client, auth_headers):
    # 1. Create property as makler
    create_payload = {
        "title": "Samarqand markazida hovli",
        "property_type": "house",
        "rent_type": "daily",
        "price": 800000.0,
        "region": "Samarqand viloyati",
        "city_district": "Samarqand shahri",
        "address": "Registon ko'chasi 5",
        "latitude": 39.6548,
        "longitude": 66.9750,
        "rooms": 4,
        "area_sqm": 150.0
    }
    res = client.post("/api/v1/properties", json=create_payload, headers=auth_headers("makler"))
    assert res.status_code == status.HTTP_201_CREATED
    prop_id = res.json()["id"]

    # 2. Mark rented ("Ijaraga berildi")
    rent_res = client.post(f"/api/v1/properties/{prop_id}/rent", headers=auth_headers("makler"))
    assert rent_res.status_code == status.HTTP_200_OK
    assert rent_res.json()["status"] == "rented"

    # 3. Close (hide) property
    close_res = client.post(f"/api/v1/properties/{prop_id}/close", headers=auth_headers("makler"))
    assert close_res.status_code == status.HTTP_200_OK
    assert close_res.json()["status"] == "hidden"

    # 4. Reopen property
    reopen_res = client.post(f"/api/v1/properties/{prop_id}/reopen", headers=auth_headers("makler"))
    assert reopen_res.status_code == status.HTTP_200_OK
    assert reopen_res.json()["status"] == "active"

    # 5. Client cannot edit or rent makler's property
    hacker_rent = client.post(f"/api/v1/properties/{prop_id}/rent", headers=auth_headers("client"))
    assert hacker_rent.status_code == status.HTTP_403_FORBIDDEN

def test_properties_search_and_filters(client, auth_headers):
    # Makler creates 2 properties with different prices and amenities
    client.post("/api/v1/properties", json={
        "title": "Arzon kvartira",
        "property_type": "apartment",
        "rent_type": "monthly",
        "price": 3000000.0,
        "region": "Toshkent shahri",
        "city_district": "Chilonzor tumani",
        "address": "Manzil 1",
        "latitude": 41.28,
        "longitude": 69.20,
        "rooms": 1,
        "area_sqm": 35.0,
        "amenities": {"wifi": "available"}
    }, headers=auth_headers("makler"))

    client.post("/api/v1/properties", json={
        "title": "Qimmat kvartira",
        "property_type": "apartment",
        "rent_type": "monthly",
        "price": 9000000.0,
        "region": "Toshkent shahri",
        "city_district": "Mirzo Ulug'bek tumani",
        "address": "Manzil 2",
        "latitude": 41.32,
        "longitude": 69.28,
        "rooms": 3,
        "area_sqm": 90.0,
        "amenities": {"wifi": "unavailable"}
    }, headers=auth_headers("makler"))

    # Filter price <= 5000000
    res = client.get("/api/v1/properties?price_max=5000000")
    assert res.status_code == status.HTTP_200_OK
    items = res.json()["items"]
    assert len(items) == 1
    assert items[0]["title"] == "Arzon kvartira"

    # Filter by wifi == available
    wifi_res = client.get("/api/v1/properties?wifi=available")
    assert wifi_res.status_code == status.HTTP_200_OK
    assert any(i["title"] == "Arzon kvartira" for i in wifi_res.json()["items"])
