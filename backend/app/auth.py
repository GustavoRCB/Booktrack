from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

# Configurações do JWT
SECRET_KEY = "ney"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Contexto de hash para senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Gera o hash de uma senha truncando para 72 bytes (limite do bcrypt)
    """
    return pwd_context.hash(password.encode("utf-8")[:72])

def verify_password(plain: str, hashed: str) -> bool:
    """
    Verifica se a senha fornecida corresponde ao hash
    """
    return pwd_context.verify(plain.encode("utf-8")[:72], hashed)

def create_access_token(data: dict) -> str:
    """
    Cria um token JWT com tempo de expiração
    """
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict | None:
    """
    Verifica e decodifica um token JWT
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

