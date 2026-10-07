from typing import Optional
from pydantic import BaseModel, EmailStr, Field, model_validator

class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    email: Optional[EmailStr] = None
    role: str = Field(default="mijoz", description="Must be 'mijoz' or 'makler'")
    password: str = Field(..., min_length=6, max_length=128)
    password_confirm: str = Field(..., min_length=6, max_length=128)
    agree_terms: bool = Field(default=True)

    @model_validator(mode="after")
    def validate_register(self):
        if self.password != self.password_confirm:
            raise ValueError("Parollar bir-biriga mos kelmadi")
        if self.role.lower() not in ["mijoz", "makler"]:
            raise ValueError("Faqat 'mijoz' yoki 'makler' sifatida ro'yxatdan o'tish mumkin")
        if not self.agree_terms:
            raise ValueError("Foydalanish shartlariga rozilik bildirish majburiy")
        return self

class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Phone number or Email")
    password: str = Field(..., min_length=1)

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    identifier: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=6, max_length=128)
    new_password_confirm: str = Field(..., min_length=6, max_length=128)

    @model_validator(mode="after")
    def validate_passwords(self):
        if self.new_password != self.new_password_confirm:
            raise ValueError("Parollar mos kelmadi")
        return self
