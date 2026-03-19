import os
import bcrypt
from jose import jwt,JWTError
from datetime import datetime, timedelta, timezone
from typing import Optional

# --- Configuration de la Sécurité ---

ENV = os.getenv("APP_ENV", "development")
SECRET_KEY = os.getenv("JWT_SECRET")

if ENV == "production" and not SECRET_KEY:
    raise RuntimeError("ERREUR CRITIQUE : JWT_SECRET doit être défini en production !")

if not SECRET_KEY:
    SECRET_KEY = "dev_secret_key_non_securisee_a_changer"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Fonctions de Hachage (Remplacement de Passlib par Bcrypt) ---

def hash_password(password: str) -> str:
    """
    Hache un mot de passe avec un sel généré par bcrypt.
    """
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie la correspondance entre le mot de passe clair et le hash.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except (ValueError, TypeError, Exception):
        return False

# --- Gestion des JSON Web Tokens (JWT) ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Génère un token JWT signé pour l'authentification.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    Décode et valide un token. Retourne le payload ou None si invalide/expiré.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None