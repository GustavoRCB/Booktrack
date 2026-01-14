from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import date

from app.database.supabase_client import get_supabase
from app.dependencies import get_current_user

router = APIRouter(tags=["Profile"])


# ======================================================
# SCHEMA DE UPDATE
# ======================================================
class ProfileUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None


# ======================================================
# GET /profile/me
# ======================================================
@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    user_id = current_user["user_id"]

    # 1) Usuário
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

    # 2) Favoritos
    favorite_books = []
    if favorite_ids:
        favorite_books = (
            supabase.table("public_books")
            .select("*")
            .in_("id", favorite_ids)
            .execute()
            .data
            or []
        )

    # 3) Recentes
    recent_books = []
    if recent_ids:
        recent_books = (
            supabase.table("public_books")
            .select("*")
            .in_("id", recent_ids)
            .execute()
            .data
            or []
        )

    # 4) user_books
    ub_res = (
        supabase.table("user_books")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )

    user_book_ids = [ub["id"] for ub in (ub_res.data or [])]

    # 5) Ratings
    ratings = []
    if user_book_ids:
        rev_res = (
            supabase.table("reviews")
            .select("rating")
            .in_("user_book_id", user_book_ids)
            .execute()
        )
        ratings = [
            r["rating"]
            for r in (rev_res.data or [])
            if r.get("rating") is not None
        ]

    # 6) Livros finalizados (TOTAL)
    finished_books = set()
    if user_book_ids:
        progress_res = (
            supabase.table("progress")
            .select("user_book_id")
            .in_("user_book_id", user_book_ids)
            .eq("status", "finished")
            .execute()
        )
        finished_books = {
            p["user_book_id"] for p in (progress_res.data or [])
        }

    # 7) Livros finalizados NO ANO ATUAL
    finished_books_this_year = set()

    if user_book_ids:
        current_year = date.today().year
        start_date = f"{current_year}-01-01"
        end_date = f"{current_year}-12-31"

        progress_year_res = (
            supabase.table("progress")
            .select("user_book_id, completion_date")
            .in_("user_book_id", user_book_ids)
            .eq("status", "finished")
            .gte("completion_date", start_date)
            .lte("completion_date", end_date)
            .execute()
        )

        finished_books_this_year = {
            p["user_book_id"]
            for p in (progress_year_res.data or [])
            if p.get("completion_date")
        }

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
            "books_read": len(finished_books),
            "books_read_this_year": len(finished_books_this_year),
            "pages_read": 0,
            "average_rating": round(sum(ratings) / len(ratings), 2)
            if ratings else None,
        },
    }


# ======================================================
# PUT /profile   ✅ EDITAR PERFIL
# ======================================================
@router.put("")
def update_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    user_id = current_user["user_id"]

    update_data = {}

    if data.name and data.name.strip():
        update_data["name"] = data.name.strip()

    if data.bio is not None:
        update_data["bio"] = data.bio

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="Nenhum dado válido para atualizar"
        )

    supabase.table("users") \
        .update(update_data) \
        .eq("id", user_id) \
        .execute()

    return {"message": "Perfil atualizado com sucesso"}
