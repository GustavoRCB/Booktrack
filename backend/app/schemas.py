from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    bio: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class BookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    published_year: Optional[int] = None
    total_pages: Optional[int] = None

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    published_year: Optional[int] = None
    total_pages: Optional[int] = None
