from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AnnonceCreate(BaseModel):
    type: str
    objet: str
    contenu: str
    lieu_annonce: str
    user_pseudo: str
    date_fin: Optional[datetime] = None

class AnnonceUpdate(BaseModel):
    type: Optional[str] = None
    objet: Optional[str] = None
    contenu: Optional[str] = None
    lieu_annonce: Optional[str] = None
    user_pseudo: Optional[str] = None
    date_fin: Optional[datetime] = None

class AnnonceResponse(AnnonceCreate):
    id: str
    date_post: datetime
    is_active: bool