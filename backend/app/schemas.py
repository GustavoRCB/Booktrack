# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# -------------------------
# USERS
# -------------------------



# ... outras classes, se existirem

# CORREÇÃO CRÍTICA: Adicionar 'name' como campo obrigatório
class UserCreate(BaseModel):
    name: str  # <--- CAMPO OBRIGATÓRIO AGORA!
    email: EmailStr
    password: str
    bio: Optional[str] = None
    
# ... outras classes, se existirem (como UserUpdate)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    bio: Optional[str] = None

# -------------------------
# BOOKS
# -------------------------

class BookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    description: Optional[str] = None
    published_year: Optional[int] = None

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    published_year: Optional[int] = None

