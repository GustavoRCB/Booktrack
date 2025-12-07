from fastapi import APIRouter, Depends, HTTPException
from app.database.supabase_client import supabase
from app.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    # ----------------------------------------------
    # 1) Buscar dados do usuário
    # ----------------------------------------------
    user_res = (
        supabase.table("users")
        .select("id, name, email, avatar_url, bio, favorite_books, recent_books")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not user_res.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user = user_res.data

    favorite_ids = user.get("favorite_books") or []
    recent_ids = user.get("recent_books") or []

    # ----------------------------------------------
    # 2) Buscar livros favoritos
    # ----------------------------------------------
    favorite_books = []
    if favorite_ids:
        fav_res = (
            supabase.table("public_books")
            .select("*")
            .in_("id", favorite_ids)
            .execute()
        )
        favorite_books = fav_res.data

    # ----------------------------------------------
    # 3) Livros recentes
    # ----------------------------------------------
    recent_books = []
    if recent_ids:
        recent_res = (
            supabase.table("public_books")
            .select("*")
            .in_("id", recent_ids)
            .execute()
        )
        recent_books = recent_res.data

    # ----------------------------------------------
    # 4) Buscar user_books do usuário
    # ----------------------------------------------
    ub_res = (
        supabase.table("user_books")
        .select("id, book_id")
        .eq("user_id", user_id)
        .execute()
    )

    user_books = ub_res.data
    user_book_ids = [item["id"] for item in user_books]

    # ----------------------------------------------
    # 5) Buscar reviews associadas aos user_books
    # ----------------------------------------------
    ratings = []
    if user_book_ids:
        rev_res = (
            supabase.table("reviews")
            .select("rating")
            .in_("user_book_id", user_book_ids)
            .execute()
        )
        ratings = [r["rating"] for r in rev_res.data if r.get("rating")]

    # ----------------------------------------------
    # Estatísticas finais
    # ----------------------------------------------
    books_read = len(ratings)  # cada review = livro finalizado
    average_rating = sum(ratings) / len(ratings) if ratings else None

    # ----------------------------------------------
    # Resposta final
    # ----------------------------------------------
    return {
        "profile": {
            "name": user["name"],
            "email": user["email"],
            "avatar_url": user.get("avatar_url"),
            "bio": user.get("bio"),
        },
        "favorites": favorite_books,
        "recent_books": recent_books,
        "stats": {
            "books_read": books_read,
            "pages_read": 0,  # você ainda não tem pages por user
            "average_rating": average_rating
        }
    }
