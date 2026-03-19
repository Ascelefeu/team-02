from fastapi import FastAPI
from .routes.auth import router as auth_router
from .routes.messages import router as messages_router
from .database import client

app = FastAPI(
    title="API Auth & Messagerie - Recyclage de quartier",
    description="Service de gestion des utilisateurs et des communications privées",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "api2-auth-messages"
    }

app.include_router(auth_router)
app.include_router(messages_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Ferme la connexion à MongoDB proprement."""
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)