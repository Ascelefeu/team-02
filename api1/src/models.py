from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Annonce(BaseModel):
    type: str
    objet: str
    contenu: str
    lieu_annonce: str
    user_pseudo: str
    date_post: datetime = Field(default_factory=datetime.now)
    is_active: bool = True