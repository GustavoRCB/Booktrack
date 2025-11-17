import bcrypt
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "a20f971c9f381c5df61ec2d0d9480cbaebfd3fae41c08d6412dc5e2d0e1a8f30"  # 64 chars
ALGORITHM = "HS256"

# Hash da senha
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

# Verificação da senha
def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

# Criar token JWT
def create_access_token(data: dict, expires_minutes: int = 60):
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload.update({"exp": expire})

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

# Validar token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
