from fastapi import APIRouter, HTTPException
from app.database.supabase_client import supabase
from app.schemas import PublicBookCreate, PublicBookResponse

router = APIRouter(tags=["Public Books"])

# ============================================================
# LISTAR LIVROS MAIS POPULARES
# ============================================================
@router.get("/popular", response_model=list[PublicBookResponse])
def get_popular_books(limit: int = 10):
    result = (
        supabase.table("public_books")
        .select("*")
        .order("popularity", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


# ============================================================
# LISTAR TODOS
# ============================================================
@router.get("/", response_model=list[PublicBookResponse])
def list_public_books():
    result = supabase.table("public_books").select("*").execute()
    return result.data


# ============================================================
# BUSCAR POR ID
# ============================================================
@router.get("/{book_id}", response_model=PublicBookResponse)
def get_public_book(book_id: int):
    result = (
        supabase.table("public_books")
        .select("*")
        .eq("id", book_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return result.data


# ============================================================
# CRIAR
# ============================================================
@router.post("/", response_model=PublicBookResponse)
def create_public_book(book: PublicBookCreate):
    result = supabase.table("public_books").insert(book.dict()).execute()
    return result.data[0]


# ============================================================
# AUMENTAR POPULARIDADE
# ============================================================
@router.post("/{book_id}/increase-popularity")
def increase_popularity(book_id: int):

    book = (
        supabase.table("public_books")
        .select("*")
        .eq("id", book_id)
        .single()
        .execute()
    )

    if not book.data:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    current_popularity = book.data.get("popularity", 0)

    updated = (
        supabase.table("public_books")
        .update({"popularity": current_popularity + 1})
        .eq("id", book_id)
        .select("*")
        .execute()
    )

    return {
        "message": "Popularidade atualizada",
        "popularity": updated.data[0]["popularity"]
    }
