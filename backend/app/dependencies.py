from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, JWTError

security = HTTPBearer()

SECRET_KEY = "ney"
ALGORITHM = "HS256"

def get_current_user(credentials=Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

    return payload

