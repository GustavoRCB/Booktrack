# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
# =======================================================
# USERS
# =======================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    bio: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    bio: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    bio: Optional[str]

    class Config:
        from_attributes = True


# =======================================================
# PUBLIC BOOKS (Catálogo Global)
# =======================================================

class PublicBookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    published_year: Optional[int] = None

    # 🔧 CORRIGIDO — Google Books usa "page_count"
    page_count: Optional[int] = None


class PublicBookResponse(PublicBookCreate):
    id: int

    class Config:
        from_attributes = True


# =======================================================
# USER BOOKS (Biblioteca do Usuário)
# =======================================================

class UserBookResponse(BaseModel):
    id: int        # id do registro em user_books
    user_id: int
    book_id: int

    class Config:
        from_attributes = True


class UserBookDetailed(BaseModel):
    user_book_id: int
    book_id: int
    title: str
    author: Optional[str]
    description: Optional[str]
    cover_url: Optional[str]
    published_year: Optional[int]

    # 🔧 CORRIGIDO — o backend retorna "page_count"
    page_count: Optional[int] = None

    status: str = "want"

    class Config:
        from_attributes = True


# =======================================================
# PROGRESSO DE LEITURA
# =======================================================

class ProgressUpdate(BaseModel):
    status: str  # want | reading | read
    completion_date: Optional[date] = None


# =======================================================
# REVIEWS (Futuro)
# =======================================================

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewResponse(ReviewCreate):
    id: int
    user_book_id: int

    class Config:
        from_attributes = True
