from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class Message(BaseModel):
    sender_pseudo: str
    receiver_pseudo: str
    contenu: str
    annonce_id: Optional[str] = None
    date_envoi: datetime = Field(default_factory=datetime.now)
    is_read: bool = False