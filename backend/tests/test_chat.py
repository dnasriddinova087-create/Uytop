from fastapi import status

def test_chat_flow(client, auth_headers, makler_user):
    # 1. Client starts conversation with makler
    conv_res = client.post("/api/v1/conversations", json={
        "broker_id": makler_user.id,
        "initial_message": "Salom, uy hali bo'shmi?"
    }, headers=auth_headers("client"))
    assert conv_res.status_code == status.HTTP_201_CREATED
    conv_data = conv_res.json()
    conv_id = conv_data["id"]

    # 2. Makler checks conversations
    makler_convs = client.get("/api/v1/conversations", headers=auth_headers("makler"))
    assert makler_convs.status_code == status.HTTP_200_OK
    assert len(makler_convs.json()) >= 1
    assert makler_convs.json()[0]["id"] == conv_id

    # 3. Makler sends reply
    msg_res = client.post(f"/api/v1/conversations/{conv_id}/messages", json={
        "text": "Va alaykum assalom! Ha, uy bo'sh, bugun ko'rsatishim mumkin."
    }, headers=auth_headers("makler"))
    assert msg_res.status_code == status.HTTP_201_CREATED
    assert msg_res.json()["text"] == "Va alaykum assalom! Ha, uy bo'sh, bugun ko'rsatishim mumkin."

    # 4. Client retrieves messages
    client_msgs = client.get(f"/api/v1/conversations/{conv_id}/messages", headers=auth_headers("client"))
    assert client_msgs.status_code == status.HTTP_200_OK
    assert len(client_msgs.json()) == 2
