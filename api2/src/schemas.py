from typing import Optional
from datetime import datetime
from pydantic import BaseModel, model_validator, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    sender_pseudo: str
    receiver_pseudo: str
    contenu: str
    annonce_id: Optional[str] = None    # lien optionnel vers une annonce de l'API 1

    @model_validator(mode="after")
    def sender_differs_from_receiver(self) -> "MessageCreate":
        if self.sender_pseudo.strip() == self.receiver_pseudo.strip():
            raise ValueError("sender_pseudo et receiver_pseudo doivent être différents")
        return self


class MessageUpdate(BaseModel):
    contenu: Optional[str] = None
    is_read: Optional[bool] = None


class MessageResponse(MessageCreate):
    id: str
    date_envoi: datetime
    is_read: bool

class UserCreate(BaseModel):
    """Ce que l'utilisateur envoie pour s'inscrire"""
    email: EmailStr
    pseudo: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

    @field_validator("email")
    @classmethod
    def email_lowercase_and_trim(cls, v: str) -> str:
        """Nettoie uniquement l'email"""
        return v.strip().lower()

    @field_validator("pseudo")
    @classmethod
    def pseudo_trim(cls, v: str) -> str:
        """Nettoie les espaces autour du pseudo mais garde la casse"""
        return v.strip()

class UserResponse(BaseModel):
    """Ce que l'API renvoie (sécurisé, sans password)"""
    id: str
    email: EmailStr
    pseudo: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    """Ce que l'utilisateur envoie pour se connecter"""
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, v: str) -> str:
        return v.strip().lower()

class TokenResponse(BaseModel):
    """Ce que l'API renvoie après un login réussi"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse