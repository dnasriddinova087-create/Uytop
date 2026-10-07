from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateMe, ChangePasswordRequest
from app.api.deps import get_current_user
from app.services.auth import get_password_hash, verify_password
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
    if update_data.email is not None:
        # Check if email is already taken by another user
        existing = db.query(User).filter(User.email == update_data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ushbu email boshqa foydalanuvchi tomonidan band qilingan"
            )
        current_user.email = update_data.email
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
