# app/dependencies.py
from fastapi import Header, HTTPException
from app.auth import verify_token

# dependencies.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth import verify_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")
    return payload


def get_current_user(authorization: str = Header(...)):
    """
    Recupera o usuário atual a partir do token JWT.
    """
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

    return payload
