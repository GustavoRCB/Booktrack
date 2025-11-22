from fastapi import APIRouter, HTTPException
from app.database.supabase_client import supabase
from app.schemas import PublicBookCreate, PublicBookResponse

router = APIRouter()  # <-- ESTA LINHA É OBRIGATÓRIA

# ----------------------------------------
# LISTAR TODOS OS LIVROS DO CATÁLOGO PÚBLICO
# ----------------------------------------
@router.get("/", response_model=list[PublicBookResponse])
def list_public_books():
    result = supabase.table("public_books").select("*").execute()
    return result.data


# ----------------------------------------
# OBTER UM LIVRO ESPECÍFICO
# ----------------------------------------
@router.get("/{book_id}", response_model=PublicBookResponse)
def get_public_book(book_id: int):
    result = supabase.table("public_books").select("*").eq("id", book_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return result.data


# ----------------------------------------
# CRIAR LIVRO NO CATÁLOGO PÚBLICO
# ----------------------------------------
@router.post("/", response_model=PublicBookResponse)
def create_public_book(book: PublicBookCreate):
    result = supabase.table("public_books").insert(book.dict()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Erro ao inserir livro")
    return result.data[0]
