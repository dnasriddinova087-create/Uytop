from fastapi import status

def test_admin_dashboard_stats(client, auth_headers):
    # Admin accesses dashboard
    res = client.get("/api/v1/admin/dashboard", headers=auth_headers("admin"))
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "total_users" in data
    assert "active_clients" in data
    assert "active_brokers" in data
    assert "total_properties" in data

def test_non_admin_forbidden_from_admin_endpoints(client, auth_headers):
    res = client.get("/api/v1/admin/dashboard", headers=auth_headers("client"))
    assert res.status_code == status.HTTP_403_FORBIDDEN

    broker_res = client.get("/api/v1/admin/dashboard", headers=auth_headers("makler"))
    assert broker_res.status_code == status.HTTP_403_FORBIDDEN

def test_admin_user_block_and_audit(client, auth_headers, client_user):
    # Admin blocks user
    patch_res = client.patch(
        f"/api/v1/admin/users/{client_user.id}",
        json={"is_active": False},
        headers=auth_headers("admin")
    )
    assert patch_res.status_code == status.HTTP_200_OK
    assert patch_res.json()["is_active"] is False

    # Blocked client cannot login
    login_res = client.post("/api/v1/auth/login", json={
        "identifier": client_user.phone,
        "password": "ClientPass123!"
    })
    assert login_res.status_code == status.HTTP_403_FORBIDDEN

    # Check audit logs
    audit_res = client.get("/api/v1/admin/audit-logs", headers=auth_headers("admin"))
    assert audit_res.status_code == status.HTTP_200_OK
    assert audit_res.json()["total"] >= 1

def test_user_activity_recording_and_admin_delete(client, auth_headers, client_user):
    # Registered client records activity from mobile device
    act_res = client.post(
        "/api/v1/users/activity",
        json={
            "action": "MOBILE_SEARCH",
            "entity_type": "property",
            "device_info": "Mobil telefon (iPhone iOS 17)",
            "details": "Chilonzorda kvartira qidirildi"
        },
        headers=auth_headers("client")
    )
    assert act_res.status_code == status.HTTP_201_CREATED
    log_id = act_res.json()["id"]

    # Admin sees the activity in audit logs
    audit_res = client.get(
        "/api/v1/admin/audit-logs",
        params={"search": "iPhone"},
        headers=auth_headers("admin")
    )
    assert audit_res.status_code == status.HTTP_200_OK
    data = audit_res.json()
    assert any(item["id"] == log_id for item in data["items"])

    # Admin deletes this specific activity log
    del_res = client.delete(f"/api/v1/admin/audit-logs/{log_id}", headers=auth_headers("admin"))
    assert del_res.status_code == status.HTTP_200_OK

    # Non-admin cannot delete audit logs
    del_res_forbidden = client.delete(f"/api/v1/admin/audit-logs/{log_id}", headers=auth_headers("client"))
    assert del_res_forbidden.status_code == status.HTTP_403_FORBIDDEN
