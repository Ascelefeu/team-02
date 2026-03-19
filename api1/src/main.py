from fastapi import FastAPI
from .routes.annonces import router as annonces_router
from .database import client 
app = FastAPI(
    title="API Annonces - Recyclage de quartier",
    description="Gère l'authentification des utilisateurs et la messagerie privée",
    version="1.0.0"
)

# Route de santé pour le Healthcheck Docker
@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "service": "api2-auth-messages"
    }

app.include_router(annonces_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Ferme proprement la connexion à MongoDB à l'arrêt du conteneur."""
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)