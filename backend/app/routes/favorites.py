from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.database.supabase_client import supabase

# ❗ NÃO definir prefix aqui
router = APIRouter(tags=["Favorites"])


# --------------------------------------------------
# 1) LISTAR FAVORITOS
# --------------------------------------------------
@router.get("/favorites")
def list_favorites(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    user_res = (
        supabase.table("users")
        .select("favorite_books")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not user_res.data:
        return []

    favorites = user_res.data.get("favorite_books") or []

    if not favorites:
        return []

    books_res = (
        supabase.table("public_books")
        .select("*")
        .in_("id", favorites)
        .execute()
    )

    return books_res.data or []


# --------------------------------------------------
# 2) ADICIONAR FAVORITO
# --------------------------------------------------
@router.post("/favorites/{book_id}")
def add_favorite(book_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    user_res = (
        supabase.table("users")
        .select("favorite_books")
        .eq("id", user_id)
        .single()
        .execute()
    )

    favorites = user_res.data.get("favorite_books") or []

    if book_id in favorites:
        raise HTTPException(status_code=400, detail="Livro já está nos favoritos")

    favorites.append(book_id)

    supabase.table("users") \
        .update({"favorite_books": favorites}) \
        .eq("id", user_id) \
        .execute()

    return {
        "message": "Livro adicionado aos favoritos",
        "favorite_books": favorites,
    }


# --------------------------------------------------
# 3) REMOVER FAVORITO
# --------------------------------------------------
@router.delete("/favorites/{book_id}")
def remove_favorite(book_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    user_res = (
        supabase.table("users")
        .select("favorite_books")
        .eq("id", user_id)
        .single()
        .execute()
    )

    favorites = user_res.data.get("favorite_books") or []

    if book_id not in favorites:
        raise HTTPException(status_code=404, detail="Livro não está nos favoritos")

    favorites = [b for b in favorites if b != book_id]

    supabase.table("users") \
        .update({"favorite_books": favorites}) \
        .eq("id", user_id) \
        .execute()

    return {
        "message": "Livro removido dos favoritos",
        "favorite_books": favorites,
    }
