# routes/annonces.py
from fastapi import APIRouter
from ..schemas import AnnonceCreate
router = APIRouter()

@router.get("/annonces")
async def lister_annonces():
    return [...]

@router.post("/annonces")
async def creer_annonce(annonce: AnnonceCreate):
    return {...}

@router.get("/annonces/{annonce_id}")
async def obtenir_annonce(annonce_id: str):
    return {...}    

@router.put("/annonces/{annonce_id}")
async def mettre_a_jour_annonce(annonce_id: str, annonce: AnnonceCreate):
    return {...}

@router.delete("/annonces/{annonce_id}")
async def supprimer_annonce(annonce_id: str):
    return {...}

