# usersbook
from fastapi import APIRouter, HTTPException, Depends
from app.database.supabase_client import supabase
from app.schemas import UserBookResponse, UserBookDetailed, ProgressUpdate
from app.dependencies import get_current_user

router = APIRouter()

# ----------------------------------------
# LISTAR TODOS OS LIVROS DA BIBLIOTECA DO USUÁRIO
# ----------------------------------------
@router.get("/", response_model=list[UserBookDetailed])
def list_user_books(user=Depends(get_current_user)):
    user_id = user["user_id"]

    # Pega todos os registros do usuário
    query_result = supabase.table("user_books").select("*").eq("user_id", user_id).execute().data

    detailed_list = []

    for item in query_result:
        book_id = item["book_id"]

        # Busca o livro completo na tabela public_books
        book = supabase.table("public_books").select("*").eq("id", book_id).maybe_single().execute().data
        if not book:
            continue  # pula caso o livro não exista

        # Busca progresso (status) do livro
        progress_data = supabase.table("progress").select("*").eq("user_book_id", item["id"]).execute().data
        status = progress_data[0]["status"] if progress_data and len(progress_data) > 0 else "want"

        detailed_list.append({
            "user_book_id": item["id"],
            "title": book["title"],
            "author": book.get("author"),
            "description": book.get("description"),
            "cover_url": book.get("cover_url"),
            "published_year": book.get("published_year"),
            "total_pages": book.get("total_pages"),
            "status": status
        })

    return detailed_list

# ----------------------------------------
# ADICIONAR UM LIVRO À BIBLIOTECA DO USUÁRIO
# ----------------------------------------
@router.post("/add/{book_id}", response_model=UserBookResponse)
def add_book(book_id: int, user=Depends(get_current_user)):
    user_id = user["user_id"]

    exists = supabase.table("user_books").select("*") \
        .eq("user_id", user_id).eq("book_id", book_id).execute().data

    if exists:
        raise HTTPException(status_code=400, detail="Livro já está na sua biblioteca")

    result = supabase.table("user_books").insert({
        "user_id": user_id,
        "book_id": book_id
    }).execute()

    supabase.table("progress").insert({
        "user_book_id": result.data[0]["id"],
        "status": "want"
    }).execute()

    return result.data[0]

# ----------------------------------------
# REMOVER LIVRO DA BIBLIOTECA
# ----------------------------------------
@router.delete("/remove/{user_book_id}")
def remove_book(user_book_id: int, user=Depends(get_current_user)):
    user_id = user["user_id"]

    record = supabase.table("user_books").select("*") \
        .eq("id", user_book_id).eq("user_id", user_id).maybe_single().execute().data

    if not record:
        raise HTTPException(status_code=404, detail="Livro não encontrado na sua biblioteca")

    supabase.table("user_books").delete().eq("id", user_book_id).execute()

    return {"message": "Livro removido da biblioteca"}

# ----------------------------------------
# ATUALIZAR O STATUS (progress)
# ----------------------------------------
@router.put("/{user_book_id}/progress")
def update_progress(user_book_id: int, update: ProgressUpdate, user=Depends(get_current_user)):
    user_id = user["user_id"]

    # Verifica se o user_book_id existe
    record_response = supabase.table("user_books").select("*") \
        .eq("id", user_book_id).eq("user_id", user_id).maybe_single().execute()

    if not record_response or not record_response.data:
        raise HTTPException(status_code=404, detail="Livro não encontrado na sua biblioteca")

    # Verifica se já existe progresso
    existing_response = supabase.table("progress").select("*") \
        .eq("user_book_id", user_book_id).maybe_single().execute()

    if existing_response and existing_response.data and existing_response.data.get("id"):
        # Atualiza o progresso existente
        supabase.table("progress").update({"status": update.status}) \
            .eq("user_book_id", user_book_id).execute()
    else:
        # Cria um novo registro de progresso
        supabase.table("progress").insert({
            "user_book_id": user_book_id,
            "status": update.status
        }).execute()

    return {"message": "Status atualizado com sucesso"}

