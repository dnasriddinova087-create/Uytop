from fastapi import status

def test_register_client_success(client):
    payload = {
        "first_name": "Aziz",
        "last_name": "Nazarov",
        "phone": "+998901234567",
        "email": "aziz@example.com",
        "role": "mijoz",
        "password": "SecretPassword123!",
        "password_confirm": "SecretPassword123!",
        "agree_terms": True
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["phone"] == "+998901234567"
    assert data["user"]["role"] == "mijoz"

def test_cannot_register_admin_directly(client):
    payload = {
        "first_name": "Hacker",
        "last_name": "Bad",
        "phone": "+998907777777",
        "email": "hacker@example.com",
        "role": "admin",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "agree_terms": True
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY or response.status_code == status.HTTP_400_BAD_REQUEST

def test_register_password_mismatch(client):
    payload = {
        "first_name": "Ali",
        "last_name": "Valiyev",
        "phone": "+998901111111",
        "role": "mijoz",
        "password": "Password123!",
        "password_confirm": "Different123!",
        "agree_terms": True
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_login_success_and_refresh(client, client_user):
    payload = {
        "identifier": client_user.phone,
        "password": "ClientPass123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    refresh_token = data["refresh_token"]

    # Test refresh token
    ref_response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_response.status_code == status.HTTP_200_OK
    assert "access_token" in ref_response.json()

def test_login_invalid_password(client, client_user):
    payload = {
        "identifier": client_user.phone,
        "password": "WrongPassword!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user_me(client, auth_headers):
    response = client.get("/api/v1/users/me", headers=auth_headers("client"))
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["role"] == "mijoz"
