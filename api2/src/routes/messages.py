from fastapi import APIRouter, HTTPException
from ..schemas import MessageCreate, MessageResponse, MessageUpdate
from ..database import database
from ..redis_client import redis_client
from datetime import datetime
from bson import ObjectId
import json

router = APIRouter()


# ── POST /messages ────────────────────────────────────────────
@router.post("/messages")
async def envoyer_message(message: MessageCreate) -> MessageResponse:
    collection = database["messages"]

    doc = message.dict()
    doc["date_envoi"] = datetime.now()
    doc["is_read"] = False

    result = await collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)

    # Notification Redis pub/sub (bonus)
    try:
        await redis_client.publish(
            "notifications",
            json.dumps({
                "type": "NEW_MESSAGE",
                "receiver_pseudo": doc["receiver_pseudo"],
                "sender_pseudo": doc["sender_pseudo"],
                "message_id": doc["id"],
                "annonce_id": doc.get("annonce_id"),
            }),
        )
    except Exception as e:
        print(f"[Redis] Publish failed (non-blocking): {e}")

    return MessageResponse(**doc)


# ── GET /messages/inbox/{pseudo} ──────────────────────────────
@router.get("/messages/inbox/{pseudo}")
async def boite_reception(
    pseudo: str,
    page: int = 1,
    limit: int = 20,
    unread_only: bool = False,
) -> dict:
    collection = database["messages"]

    filtre = {"receiver_pseudo": pseudo}
    if unread_only:
        filtre["is_read"] = False

    skip = (page - 1) * limit
    cursor = collection.find(filtre).sort("date_envoi", -1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=limit)
    for m in messages:
        m["id"] = str(m.pop("_id"))

    total = await collection.count_documents(filtre)
    unread_count = await collection.count_documents(
        {"receiver_pseudo": pseudo, "is_read": False}
    )

    return {
        "data": messages,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": -(-total // limit),
        "unread_count": unread_count,
    }


# ── GET /messages/conversation/{pseudo_a}/{pseudo_b} ─────────
@router.get("/messages/conversation/{pseudo_a}/{pseudo_b}")
async def conversation(pseudo_a: str, pseudo_b: str, page: int = 1, limit: int = 50) -> dict:
    collection = database["messages"]

    filtre = {
        "$or": [
            {"sender_pseudo": pseudo_a, "receiver_pseudo": pseudo_b},
            {"sender_pseudo": pseudo_b, "receiver_pseudo": pseudo_a},
        ]
    }
    skip = (page - 1) * limit
    cursor = collection.find(filtre).sort("date_envoi", 1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=limit)
    for m in messages:
        m["id"] = str(m.pop("_id"))

    total = await collection.count_documents(filtre)

    return {
        "data": messages,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": -(-total // limit),
    }


# ── GET /messages/{message_id} ────────────────────────────────
@router.get("/messages/{message_id}")
async def obtenir_message(message_id: str) -> MessageResponse:
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="message_id invalide")

    collection = database["messages"]
    message = await collection.find_one({"_id": ObjectId(message_id)})
    if message:
        message["id"] = str(message.pop("_id"))
    else:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    return MessageResponse(**message)


# ── PATCH /messages/{message_id}/read ────────────────────────
@router.patch("/messages/{message_id}/read")
async def marquer_lu(message_id: str) -> MessageResponse:
    return await _set_read(message_id, is_read=True)


# ── PATCH /messages/{message_id}/unread ──────────────────────
@router.patch("/messages/{message_id}/unread")
async def marquer_non_lu(message_id: str) -> MessageResponse:
    return await _set_read(message_id, is_read=False)


# ── PATCH /messages/inbox/{pseudo}/read-all ───────────────────
@router.patch("/messages/inbox/{pseudo}/read-all")
async def tout_marquer_lu(pseudo: str) -> dict:
    collection = database["messages"]
    result = await collection.update_many(
        {"receiver_pseudo": pseudo, "is_read": False},
        {"$set": {"is_read": True}},
    )
    return {"message": "Tous les messages marqués comme lus", "updated": result.modified_count}


# ── DELETE /messages/{message_id} ────────────────────────────
@router.delete("/messages/{message_id}")
async def supprimer_message(message_id: str):
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="message_id invalide")

    collection = database["messages"]
    message = await collection.find_one({"_id": ObjectId(message_id)})
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    result = await collection.delete_one({"_id": ObjectId(message_id)})
    if result.deleted_count == 1:
        return {"message": "Message supprimé avec succès"}
    else:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


# ── Internal helper ───────────────────────────────────────────
async def _set_read(message_id: str, is_read: bool) -> MessageResponse:
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="message_id invalide")

    collection = database["messages"]
    doc = await collection.find_one_and_update(
        {"_id": ObjectId(message_id)},
        {"$set": {"is_read": is_read}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    doc["id"] = str(doc.pop("_id"))
    return MessageResponse(**doc)