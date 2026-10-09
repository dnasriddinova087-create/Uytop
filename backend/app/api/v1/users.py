import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateMe, ChangePasswordRequest, UserActivityCreate
from app.api.deps import get_current_user
from app.services.auth import get_password_hash, verify_password
from app.services.file_upload import save_uploaded_image
from app.services.audit import log_audit

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_me(
    update_data: UserUpdateMe,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.first_name is not None:
        current_user.first_name = update_data.first_name.strip()
    if update_data.last_name is not None:
        current_user.last_name = update_data.last_name.strip()
    if update_data.phone is not None:
        clean_phone = update_data.phone.strip()
        if clean_phone != current_user.phone:
            existing_phone = db.query(User).filter(User.phone == clean_phone, User.id != current_user.id).first()
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ushbu telefon raqami allaqachon boshqa akkauntga biriktirilgan"
                )
            current_user.phone = clean_phone
    if update_data.email is not None:
        clean_email = update_data.email.strip() if update_data.email else None
        if clean_email:
            existing = db.query(User).filter(User.email == clean_email, User.id != current_user.id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ushbu email boshqa foydalanuvchi tomonidan band qilingan"
                )
        current_user.email = clean_email
    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url

    db.commit()
    db.refresh(current_user)
    
    log_audit(
        db,
        action="USER_UPDATE_PROFILE",
        entity_type="user",
        user_id=current_user.id,
        entity_id=current_user.id
    )
    
    return current_user

@router.post("/me/avatar", response_model=UserResponse)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    avatar_url = save_uploaded_image(file)
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    log_audit(
        db,
        action="USER_UPDATE_AVATAR",
        entity_type="user",
        user_id=current_user.id,
        entity_id=current_user.id
    )

    return current_user

@router.post("/me/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Eski parol noto'g'ri kiritildi"
        )
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    
    log_audit(
        db,
        action="PASSWORD_CHANGE",
        entity_type="user",
        user_id=current_user.id,
        entity_id=current_user.id
    )
    
    return {"message": "Parol muvaffaqiyatli almashtirildi"}

@router.post("/activity", status_code=status.HTTP_201_CREATED)
def record_user_activity(
    data: UserActivityCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Immediately logs registered user actions from any device, persisting until deleted by admin."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")

    details_data = {}
    if data.details:
        try:
            details_data = json.loads(data.details) if data.details.strip().startswith("{") else {"info": data.details}
        except Exception:
            details_data = {"info": data.details}

    if data.device_info:
        details_data["device"] = data.device_info
    elif user_agent:
        details_data["device"] = user_agent[:120]

    log = log_audit(
        db,
        action=data.action,
        entity_type=data.entity_type,
        user_id=current_user.id,
        entity_id=data.entity_id,
        details=details_data,
        ip_address=client_ip
    )
    return {"status": "ok", "id": log.id, "action": log.action}
