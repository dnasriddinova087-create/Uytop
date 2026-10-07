from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.user import UserResponse, TokenResponse
from app.services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.services.audit import log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request_data: RegisterRequest, db: Session = Depends(get_db)):
    # Check phone uniqueness
    existing_phone = db.query(User).filter(User.phone == request_data.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ushbu telefon raqami allaqachon ro'yxatdan o'tgan"
        )
    
    # Check email uniqueness if provided
    if request_data.email:
        existing_email = db.query(User).filter(User.email == request_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ushbu email manzili allaqachon ro'yxatdan o'tgan"
            )
    
    # Role safety: only 'mijoz' or 'makler' allowed from registration endpoint
    role_normalized = request_data.role.strip().lower()
    if role_normalized not in [UserRole.MIJOZ.value, UserRole.MAKLER.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faqat mijoz yoki makler roli tanlanishi mumkin"
        )
    
    # Create user
    try:
        new_user = User(
            first_name=request_data.first_name.strip(),
            last_name=request_data.last_name.strip(),
            phone=request_data.phone.strip(),
            email=request_data.email.strip() if request_data.email else None,
            hashed_password=get_password_hash(request_data.password),
            role=role_normalized,
            is_active=True,
            is_verified=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Foydalanuvchini bazaga saqlashda xatolik: {str(e)}"
        )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    # Audit log (non-blocking)
    try:
        log_audit(
            db,
            action="USER_REGISTER",
            entity_type="user",
            user_id=new_user.id,
            entity_id=new_user.id,
            details={"role": new_user.role, "phone": new_user.phone}
        )
    except Exception:
        pass
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(request_data: LoginRequest, db: Session = Depends(get_db)):
    ident = request_data.identifier.strip()
    # Search by phone or email
    user = db.query(User).filter(
        (User.phone == ident) | (User.email == ident)
    ).first()
    
    if not user or not verify_password(request_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Telefon raqami/email yoki parol noto'g'ri"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akkauntingiz bloklangan. Administrator bilan bog'laning"
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/refresh")
def refresh_token(request_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(request_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yaroqsiz yoki eskirgan refresh token"
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Foydalanuvchi topilmadi yoki faol emas"
        )
    
    new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    return {"message": "Muvaffaqiyatli chiqildi"}

@router.post("/forgot-password")
def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    ident = request_data.identifier.strip()
    user = db.query(User).filter((User.phone == ident) | (User.email == ident)).first()
    if not user:
        # Avoid leaking user existence, return safe message
        return {"message": "Agar akkaunt mavjud bo'lsa, parolni tiklash ma'lumotlari yuborildi"}
    
    reset_token = create_password_reset_token(str(user.id))
    # In production, send via SMS/email; for local dev, return token for verification
    return {
        "message": "Parolni tiklash tokeni yaratildi",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(request_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user_id_str = verify_password_reset_token(request_data.reset_token)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yaroqsiz yoki muddati o'tgan tiklash tokeni"
        )
    
    user = db.query(User).filter(User.id == int(user_id_str)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foydalanuvchi topilmadi"
        )
    
    user.hashed_password = get_password_hash(request_data.new_password)
    db.commit()
    
    log_audit(
        db,
        action="PASSWORD_RESET",
        entity_type="user",
        user_id=user.id,
        entity_id=user.id
    )
    
    return {"message": "Parol muvaffaqiyatli yangilandi. Endi yangi parol bilan tizimga kiring"}
