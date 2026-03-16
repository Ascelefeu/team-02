# routes/annonces.py
from fastapi import APIRouter
from ..schemas import AnnonceCreate, AnnonceResponse, AnnonceUpdate
from ..database import database
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException

router = APIRouter()

@router.get("/annonces")
async def lister_annonces() -> list[AnnonceResponse]:
    collection = database["annonces"]
    cursor = collection.find({"is_active": True})
    annonces = await cursor.to_list(length=100)
    for annonce in annonces:
        annonce["id"] = str(annonce.pop("_id"))
    return annonces

@router.post("/annonces")
async def creer_annonce(annonce: AnnonceCreate) -> AnnonceResponse:
    collection = database["annonces"]
    
    doc = annonce.dict()
    doc["date_post"] = datetime.now()
    doc["is_active"] = True
    
    result = await collection.insert_one(doc)
    
    doc["id"] = str(result.inserted_id)
    
    return AnnonceResponse(**doc)

@router.get("/annonces/{annonce_id}")
async def obtenir_annonce(annonce_id: str) -> AnnonceResponse:
    collection = database["annonces"]
    annonce = await collection.find_one({"_id": ObjectId(annonce_id)})
    if annonce:
        annonce["id"] = str(annonce.pop("_id"))
    else:
        raise HTTPException(status_code=404, detail="Annonce not found")
    return annonce

@router.put("/annonces/{annonce_id}")
async def mettre_a_jour_annonce(annonce_id: str, annonce: AnnonceUpdate) -> AnnonceResponse:
    collection = database["annonces"]
    
    # Filtrer les champs non None
    update_data = {k: v for k, v in annonce.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour")
    
    # Mettre à jour avec $set
    result = await collection.update_one({"_id": ObjectId(annonce_id)}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Annonce not found")
    
    # Récupérer l'annonce mise à jour
    updated_annonce = await collection.find_one({"_id": ObjectId(annonce_id)})
    updated_annonce["id"] = str(updated_annonce.pop("_id"))
    
    return AnnonceResponse(**updated_annonce)

@router.delete("/annonces/{annonce_id}")
async def supprimer_annonce(annonce_id: str):
    collection = database["annonces"]
    
    # Vérifier si l'annonce existe et est active
    annonce = await collection.find_one({"_id": ObjectId(annonce_id), "is_active": True})
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce not found or already deleted")
    
    # Suppression logique : désactiver l'annonce
    result = await collection.update_one({"_id": ObjectId(annonce_id)}, {"$set": {"is_active": False}})
    
    if result.modified_count == 1:
        return {"message": "Annonce supprimée avec succès (suppression logique)"}
    else:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")




