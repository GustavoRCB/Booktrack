# app/routes/external_books.py
from fastapi import APIRouter, HTTPException
from app.database.supabase_client import supabase
from app.services.google_books import search_google_books

router = APIRouter(prefix="/external-books", tags=["External Books"])


# ============================
# 🔍 BUSCA LIVROS NA GOOGLE
# ============================
@router.get("/search")
def search_books(q: str):
    if not q or q.strip() == "":
        raise HTTPException(status_code=400, detail="A query 'q' é obrigatória.")

    return search_google_books(q)


# ============================
# 🔎 PEGAR LIVRO POR GOOGLE ID
# ============================
@router.get("/google/{google_id}")
def get_google_book(google_id: str):
    """
    Retorna um livro específico da Google Books API.
    """
    results = search_google_books(google_id)

    if not results:
        raise HTTPException(status_code=404, detail="Livro não encontrado na Google Books.")

    # Google API retorna array; pegamos o primeiro match
    return results[0]


# ============================
# ➕ SALVAR LIVRO EXTERNO
# ============================
@router.post("/add")
def add_external_book(book: dict):

    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase não foi inicializado")

    # Processar published_year
    published_year = book.get("published_year")

    if published_year:
        # Se vier "2011-01-01" → vira 2011
        try:
            published_year = int(str(published_year)[:4])
        except:
            published_year = None

    book["published_year"] = published_year

    # Verificar se já existe livro igual
    existing = (
        supabase.table("public_books")
        .select("*")
        .eq("title", book["title"])
        .eq("author", book["author"])
        .execute()
    )

    if existing.data:
        return {"id": existing.data[0]["id"]}

    # Criar livro
    saved = supabase.table("public_books").insert(book).execute()

    if not saved.data:
        raise HTTPException(status_code=500, detail="Erro ao salvar livro")

    return {"id": saved.data[0]["id"]}
