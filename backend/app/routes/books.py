from fastapi import APIRouter, Depends, Header, HTTPException
from app.database.supabase_client import supabase
from app.schemas import BookCreate, BookUpdate
from app.auth import verify_token

router = APIRouter()

def get_current_user(authorization: str = Header(...)):
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

    return payload


@router.get("/")
def get_books():
    return supabase.table("books").select("*").execute().data


@router.post("/")
def create_book(book: BookCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("books").insert(book.dict()).execute().data


@router.put("/{book_id}")
def update_book(book_id: int, book: BookUpdate, current_user: dict = Depends(get_current_user)):
    book_dict = {k: v for k, v in book.dict().items() if v is not None}
    return supabase.table("books").update(book_dict).eq("id", book_id).execute().data


@router.delete("/{book_id}")
def delete_book(book_id: int, current_user: dict = Depends(get_current_user)):
    result = supabase.table("books").delete().eq("id", book_id).execute()
    return {"deleted": result.data}
