from fastapi import FastAPI
from .routes.annonces import router as annonces_router

app = FastAPI(title = "API Annonces - Recyclage de quartier")
@app.get("/health")
async def health_check():
    return {"status": "ok"}
app.include_router(annonces_router)
