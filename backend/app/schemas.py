# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# -------------------------
# USERS
# -------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    bio: Optional[str] = None

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

