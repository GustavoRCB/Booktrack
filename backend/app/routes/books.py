from fastapi import APIRouter, Depends
from app.database.supabase_client import supabase
from app.schemas import BookCreate, BookUpdate
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/")
def get_books():
    return supabase.table("books").select("*").execute().data

@router.post("/")
def create_book(book: BookCreate, user=Depends(get_current_user)):
    return supabase.table("books").insert(book.dict()).execute().data

@router.put("/{book_id}")
def update_book(book_id: int, book: BookUpdate, user=Depends(get_current_user)):
    data = {k: v for k, v in book.dict().items() if v is not None}
    return supabase.table("books").update(data).eq("id", book_id).execute().data

