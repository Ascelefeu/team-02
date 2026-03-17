from typing import Optional
from datetime import datetime
from pydantic import BaseModel, model_validator


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