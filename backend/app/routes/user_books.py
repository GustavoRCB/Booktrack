from fastapi import APIRouter, HTTPException, Depends
from app.schemas import UserBookResponse, UserBookDetailed, ProgressUpdate
from app.dependencies import get_current_user
from supabase import create_client
from supabase._sync.client import ClientOptions

from app.database.supabase_client import SUPABASE_URL, SUPABASE_KEY


# ============================================================
# CONFIGURAÇÃO SEGURA DO CLIENT SUPABASE PARA CADA REQUISIÇÃO
# ============================================================
def get_supabase():
    options = ClientOptions()
    options.http2 = False  # Desativa HTTP/2 corretamente

    return create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        options=options
    )


router = APIRouter(prefix="/users/books", tags=["User Books"])


# ============================================================
# 1. LISTAR TODOS OS LIVROS DO USUÁRIO
# ============================================================
@router.get("", response_model=list[UserBookDetailed])
def list_user_books(user=Depends(get_current_user)):
    supabase = get_supabase()
    user_id = user["user_id"]

    user_books = (
        supabase.table("user_books")
        .select("*")
        .eq("user_id", user_id)
        .execute()
        .data
    )

    detailed_list = []

    for item in user_books:
        book_id = item["book_id"]

        book = (
            supabase.table("public_books")
            .select("*")
            .eq("id", book_id)
            .maybe_single()
            .execute()
            .data
        )

        if not book:
            continue

        progress = (
            supabase.table("progress")
            .select("*")
            .eq("user_book_id", item["id"])
            .execute()
            .data
        )

        status = progress[0]["status"] if progress else "want"

        detailed_list.append({
            "user_book_id": item["id"],
            "book_id": book_id,
            "title": book["title"],
            "author": book.get("author"),
            "description": book.get("description"),
            "cover_url": book.get("cover_url"),
            "published_year": book.get("published_year"),
            "page_count": book.get("page_count"),
            "status": status
        })

    return detailed_list


# ============================================================
# 2. ADICIONAR LIVRO À BIBLIOTECA DO USUÁRIO + POPULARIDADE++
# ============================================================
@router.post("/add/{book_id}", response_model=UserBookResponse)
def add_book(book_id: int, user=Depends(get_current_user)):
    supabase = get_supabase()
    user_id = user["user_id"]

    exists = (
        supabase.table("user_books")
        .select("*")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .execute()
        .data
    )

    if exists:
        raise HTTPException(status_code=400, detail="Livro já está na biblioteca")

    # Criar relação
    insert_result = (
        supabase.table("user_books")
        .insert({"user_id": user_id, "book_id": book_id})
        .execute()
    )

    user_book_id = insert_result.data[0]["id"]

    # Criar progresso inicial
    supabase.table("progress").insert({
        "user_book_id": user_book_id,
        "status": "want"
    }).execute()

    # ============================================================
    # POPULARIDADE DO LIVRO (incrementa +1)
    # ============================================================
    try:
        book_data = (
            supabase.table("public_books")
            .select("popularity")
            .eq("id", book_id)
            .maybe_single()
            .execute()
            .data
        )

        current_popularity = book_data.get("popularity", 0) if book_data else 0

        supabase.table("public_books").update({
            "popularity": current_popularity + 1
        }).eq("id", book_id).execute()

    except Exception as e:
        print("⚠️ Erro ao atualizar popularidade:", e)

    return insert_result.data[0]


# ============================================================
# 3. REMOVER LIVRO DA BIBLIOTECA DO USUÁRIO
# ============================================================
@router.delete("/remove/{user_book_id}")
def remove_book(user_book_id: int, user=Depends(get_current_user)):
    supabase = get_supabase()
    user_id = user["user_id"]

    record = (
        supabase.table("user_books")
        .select("*")
        .eq("id", user_book_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
        .data
    )

    if not record:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    supabase.table("user_books").delete().eq("id", user_book_id).execute()

    return {"message": "Livro removido com sucesso"}


# ============================================================
# 4. ATUALIZAR STATUS DE LEITURA
# ============================================================
@router.put("/{user_book_id}/progress")
def update_progress(user_book_id: int, update: ProgressUpdate, user=Depends(get_current_user)):
    supabase = get_supabase()
    user_id = user["user_id"]

    user_book = (
        supabase.table("user_books")
        .select("*")
        .eq("id", user_book_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    if not user_book or not user_book.data:
        raise HTTPException(status_code=404, detail="Livro não está na biblioteca")

    progress = (
        supabase.table("progress")
        .select("*")
        .eq("user_book_id", user_book_id)
        .maybe_single()
        .execute()
    )

    if progress and progress.data:
        supabase.table("progress").update({"status": update.status}).eq("user_book_id", user_book_id).execute()
    else:
        supabase.table("progress").insert({
            "user_book_id": user_book_id,
            "status": update.status
        }).execute()

    return {"message": "Status atualizado com sucesso"}
