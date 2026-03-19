from fastapi import APIRouter, HTTPException, status
from typing import Any
from datetime import timedelta, datetime

# Imports locaux
from ..schemas import UserCreate, UserResponse, LoginRequest, TokenResponse  # ✅
from ..security import (
    hash_password, 
    verify_password, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..database import users_collection

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post(
    "/register", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED
)
async def register(user_in: UserCreate) -> Any:
    query = {
        "$or": [
            {"email": user_in.email},
            {"pseudo": user_in.pseudo}
        ]
    }
    existing_user = await users_collection.find_one(query)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ou pseudo déjà utilisé."
        )

    user_dict = user_in.model_dump()
    user_dict["password_hash"] = hash_password(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()

    result = await users_collection.insert_one(user_dict)
    
    user_dict["id"] = str(result.inserted_id)
    return user_dict

@router.post(
    "/login", 
    response_model=TokenResponse
)
async def login(credentials: LoginRequest) -> Any:
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect."
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["pseudo"], "email": user["email"]}, 
        expires_delta=access_token_expires
    )

    user["id"] = str(user["_id"]) 
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }