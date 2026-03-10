# routes/annonces.py
from fastapi import APIRouter
from ..schemas import AnnonceCreate, AnnonceResponse
from ..database import database
from datetime import datetime

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
async def obtenir_annonce(annonce_id: str):
    return {...}    

@router.put("/annonces/{annonce_id}")
async def mettre_a_jour_annonce(annonce_id: str, annonce: AnnonceCreate):
    return {...}

@router.delete("/annonces/{annonce_id}")
async def supprimer_annonce(annonce_id: str):
    return {...}




