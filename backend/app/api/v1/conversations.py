from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User
from app.models.chat import Conversation, Message
from app.models.property import Property
from app.schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations & Chat"])

def _format_conversation(conv: Conversation, current_user_id: int) -> ConversationResponse:
    last_msg = conv.messages[-1] if conv.messages else None
    unread = sum(1 for m in conv.messages if not m.is_read and m.sender_id != current_user_id)
    
    last_msg_schema = None
    if last_msg:
        last_msg_schema = MessageResponse(
            id=last_msg.id,
            conversation_id=last_msg.conversation_id,
            sender_id=last_msg.sender_id,
            text=last_msg.text,
            is_read=last_msg.is_read,
            created_at=last_msg.created_at
        )

    return ConversationResponse(
        id=conv.id,
        client_id=conv.client_id,
        broker_id=conv.broker_id,
        property_id=conv.property_id,
        client=UserResponse.model_validate(conv.client) if conv.client else None,
        broker=UserResponse.model_validate(conv.broker) if conv.broker else None,
        last_message=last_msg_schema,
        unread_count=unread,
        created_at=conv.created_at,
        updated_at=conv.updated_at
    )

@router.get("", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = db.query(Conversation).filter(
        (Conversation.client_id == current_user.id) | (Conversation.broker_id == current_user.id)
    ).options(
        joinedload(Conversation.client),
        joinedload(Conversation.broker),
        joinedload(Conversation.messages)
    ).order_by(Conversation.updated_at.desc()).all()

    return [_format_conversation(c, current_user.id) for c in convs]

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def start_or_get_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if conv_in.broker_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O'zingiz bilan suhbat boshlay olmaysiz"
        )

    broker = db.query(User).filter(User.id == conv_in.broker_id).first()
    if not broker:
        raise HTTPException(status_code=404, detail="Makler yoki foydalanuvchi topilmadi")

    # Check existing conversation
    existing = db.query(Conversation).filter(
        Conversation.client_id == current_user.id,
        Conversation.broker_id == conv_in.broker_id,
        Conversation.property_id == conv_in.property_id
    ).options(
        joinedload(Conversation.client),
        joinedload(Conversation.broker),
        joinedload(Conversation.messages)
    ).first()

    if existing:
        if conv_in.initial_message:
            msg = Message(
                conversation_id=existing.id,
                sender_id=current_user.id,
                text=conv_in.initial_message.strip()
            )
            db.add(msg)
            existing.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
        return _format_conversation(existing, current_user.id)

    # Create new conversation
    new_conv = Conversation(
        client_id=current_user.id,
        broker_id=conv_in.broker_id,
        property_id=conv_in.property_id
    )
    db.add(new_conv)
    db.flush()

    if conv_in.initial_message:
        msg = Message(
            conversation_id=new_conv.id,
            sender_id=current_user.id,
            text=conv_in.initial_message.strip()
        )
        db.add(msg)

    db.commit()
    db.refresh(new_conv)

    conv_loaded = db.query(Conversation).filter(Conversation.id == new_conv.id).options(
        joinedload(Conversation.client),
        joinedload(Conversation.broker),
        joinedload(Conversation.messages)
    ).first()

    return _format_conversation(conv_loaded, current_user.id)

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi")

    if conv.client_id != current_user.id and conv.broker_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")

    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()

    # Mark unread messages from other user as read
    updated = False
    for m in messages:
        if not m.is_read and m.sender_id != current_user.id:
            m.is_read = True
            updated = True
    if updated:
        db.commit()

    return [MessageResponse.model_validate(m) for m in messages]

@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: int,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi")

    if conv.client_id != current_user.id and conv.broker_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Ruxsat berilmagan")

    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        text=msg_in.text.strip(),
        is_read=False
    )
    db.add(msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)

    return MessageResponse.model_validate(msg)
