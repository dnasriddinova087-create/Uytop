from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.chat import Message
from app.models.property import Property, PropertyStatus
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return notifications relevant to the user, such as new messages, listing status updates."""
    notifications = []
    
    # Check unread messages
    unread_messages_count = db.query(Message).join(Message.conversation).filter(
        (Message.conversation.has(client_id=current_user.id) | Message.conversation.has(broker_id=current_user.id)),
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).count()

    if unread_messages_count > 0:
        notifications.append({
            "id": "unread-messages",
            "type": "message",
            "title": "Yangi xabarlar",
            "message": f"Sizda {unread_messages_count} ta o'qilmagan xabar bor",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # For brokers, check properties status
    if current_user.role in ["makler", "admin"]:
        rented_props = db.query(Property).filter(
            Property.owner_id == current_user.id,
            Property.status == PropertyStatus.RENTED.value
        ).count()
        if rented_props > 0:
            notifications.append({
                "id": f"rented-count-{rented_props}",
                "type": "property",
                "title": "Ijaradagi uylar",
                "message": f"Sizda {rented_props} ta ijaraga berilgan uy mavjud",
                "read": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

    return notifications
