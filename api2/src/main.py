from fastapi import FastAPI
from .routes.messages import router as messages_router

app = FastAPI(title="API Messagerie - Recyclage de quartier")


@app.get("/health")
async def health_check():
    return {"status": "ok"}


app.include_router(messages_router)