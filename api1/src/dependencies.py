import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError

SECRET_KEY = os.getenv("JWT_SECRET", "dev_secret_key_non_securisee_a_changer")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user_pseudo(token: str = Depends(oauth2_scheme)) -> str:
    """
    Dépendance pour API 1 : décode le token pour extraire le pseudo.
    Pas besoin de chercher en DB ici, le token signé suffit à prouver l'identité.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        pseudo: str = payload.get("sub")
        if pseudo is None:
            raise HTTPException(status_code=401, detail="Token invalide : pseudo manquant")
        return pseudo
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )