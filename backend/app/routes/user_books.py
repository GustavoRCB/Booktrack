from fastapi import APIRouter, HTTPException, Depends
from datetime import date

from app.schemas import UserBookResponse, UserBookDetailed, ProgressUpdate
from app.dependencies import get_current_user
from app.database.supabase_client import get_supabase

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
            .maybe_single()
            .execute()
            .data
        )

        detailed_list.append({
            "user_book_id": item["id"],
            "book_id": book_id,
            "title": book["title"],
            "author": book.get("author"),
            "description": book.get("description"),
            "cover_url": book.get("cover_url"),
            "published_year": book.get("published_year"),
            "page_count": book.get("page_count"),
            "status": progress["status"] if progress else "want",
            "completion_date": progress.get("completion_date") if progress else None
        })

    return detailed_list


# ============================================================
# 2. ADICIONAR LIVRO À BIBLIOTECA
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

    insert_result = (
        supabase.table("user_books")
        .insert({"user_id": user_id, "book_id": book_id})
        .execute()
    )

    user_book_id = insert_result.data[0]["id"]

    supabase.table("progress").insert({
        "user_book_id": user_book_id,
        "status": "want"
    }).execute()

    return insert_result.data[0]


# ============================================================
# 3. REMOVER LIVRO DA BIBLIOTECA
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
# 4. ATUALIZAR STATUS + DATA DE CONCLUSÃO
# ============================================================
@router.put("/{user_book_id}/progress")
def update_progress(
    user_book_id: int,
    update: ProgressUpdate,
    user=Depends(get_current_user)
):
    supabase = get_supabase()
    user_id = user["user_id"]

    user_book = (
        supabase.table("user_books")
        .select("*")
        .eq("id", user_book_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
        .data
    )

    if not user_book:
        raise HTTPException(status_code=404, detail="Livro não está na biblioteca")

    completion_date = None

    if update.status == "finished" and update.completion_date:
        completion_date = (
            date.fromisoformat(update.completion_date)
            if isinstance(update.completion_date, str)
            else update.completion_date
        )

        if completion_date > date.today():
            raise HTTPException(
                status_code=400,
                detail="Data de conclusão não pode ser futura"
            )

    payload = {
        "status": update.status,
        "completion_date": completion_date.isoformat() if completion_date else None
    }

    progress = (
        supabase.table("progress")
        .select("*")
        .eq("user_book_id", user_book_id)
        .maybe_single()
        .execute()
        .data
    )

    if progress:
        supabase.table("progress").update(payload).eq(
            "user_book_id", user_book_id
        ).execute()
    else:
        supabase.table("progress").insert({
            "user_book_id": user_book_id,
            **payload
        }).execute()

    return {"message": "Status atualizado com sucesso"}
