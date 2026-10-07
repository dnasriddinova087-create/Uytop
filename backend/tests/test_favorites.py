from fastapi import status

def test_favorites_flow(client, auth_headers):
    # 1. Create property
    res = client.post("/api/v1/properties", json={
        "title": "Sevimlilar uchun uy",
        "property_type": "apartment",
        "rent_type": "monthly",
        "price": 4000000.0,
        "region": "Toshkent shahri",
        "city_district": "Yakkasaroy",
        "address": "Shota Rustaveli",
        "latitude": 41.29,
        "longitude": 69.25,
        "rooms": 2,
        "area_sqm": 50.0
    }, headers=auth_headers("makler"))
    prop_id = res.json()["id"]

    # 2. Client adds to favorites
    fav_res = client.post(f"/api/v1/favorites/{prop_id}", headers=auth_headers("client"))
    assert fav_res.status_code == status.HTTP_200_OK

    # 3. Client lists favorites
    list_fav = client.get("/api/v1/favorites", headers=auth_headers("client"))
    assert list_fav.status_code == status.HTTP_200_OK
    fav_items = list_fav.json()
    assert len(fav_items) >= 1
    assert fav_items[0]["id"] == prop_id

    # 4. Client removes from favorites
    del_fav = client.delete(f"/api/v1/favorites/{prop_id}", headers=auth_headers("client"))
    assert del_fav.status_code == status.HTTP_200_OK

    # 5. List favorites is now empty
    list_fav_after = client.get("/api/v1/favorites", headers=auth_headers("client"))
    assert len(list_fav_after.json()) == 0
