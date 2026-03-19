from fastapi import APIRouter, HTTPException, Depends, status
from ..schemas import AnnonceCreate, AnnonceResponse, AnnonceUpdate
from ..database import database
from ..dependencies import get_current_user_pseudo  # Import de la dépendance API 1
from datetime import datetime, timezone
from bson import ObjectId
from typing import List

router = APIRouter(tags=["annonces"])

@router.get("/annonces", response_model=List[AnnonceResponse])
async def lister_annonces():
    """Public : Liste toutes les annonces actives."""
    collection = database["annonces"]
    cursor = collection.find({"is_active": True})
    annonces = await cursor.to_list(length=100)
    for annonce in annonces:
        annonce["id"] = str(annonce.pop("_id"))
    return annonces

@router.post("/annonces", response_model=AnnonceResponse, status_code=status.HTTP_201_CREATED)
async def creer_annonce(
    annonce: AnnonceCreate,
    current_user: str = Depends(get_current_user_pseudo) # Protégé : nécessite un token
):
    """Connecté : Crée une annonce liée au pseudo du token."""
    collection = database["annonces"]
    
    doc = annonce.model_dump() # Utilise model_dump() pour Pydantic V2
    doc["user_pseudo"] = current_user # On force le propriétaire via le JWT
    doc["date_post"] = datetime.now(timezone.utc)
    doc["is_active"] = True
    
    result = await collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    
    return doc

@router.get("/annonces/{annonce_id}", response_model=AnnonceResponse)
async def obtenir_annonce(annonce_id: str):
    """Public : Voir le détail d'une annonce."""
    collection = database["annonces"]
    try:
        annonce = await collection.find_one({"_id": ObjectId(annonce_id), "is_active": True})
    except Exception:
        raise HTTPException(status_code=400, detail="ID invalide")

    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    
    annonce["id"] = str(annonce.pop("_id"))
    return annonce

@router.delete("/annonces/{annonce_id}")
async def supprimer_annonce(
    annonce_id: str,
    current_user: str = Depends(get_current_user_pseudo) # Protégé
):
    """Connecté + Propriétaire : Désactivation logique."""
    collection = database["annonces"]
    
    # 1. Chercher l'annonce
    try:
        annonce = await collection.find_one({"_id": ObjectId(annonce_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID invalide")

    if not annonce or not annonce.get("is_active"):
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    
    # 2. Vérifier si l'utilisateur est le propriétaire
    if annonce.get("user_pseudo") != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Vous n'êtes pas le propriétaire de cette annonce"
        )
    
    # 3. Suppression logique
    await collection.update_one(
        {"_id": ObjectId(annonce_id)}, 
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Annonce supprimée (désactivée) avec succès"}