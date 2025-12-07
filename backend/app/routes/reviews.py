from fastapi import APIRouter, Depends, HTTPException
from app.database.supabase_client import supabase
from app.dependencies import get_current_user
from app.schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])


# ============================================================
# 1) ADICIONAR OU ATUALIZAR REVIEW
# ============================================================
@router.post("/{book_id}", response_model=ReviewResponse)
def add_or_update_review(
    book_id: int,
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    rating = review_data.rating
    comment = review_data.comment or ""

    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating deve ser entre 1 e 5.")

    # Buscar user_book_id de forma segura
    ub_res = supabase.table("user_books") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("book_id", book_id) \
        .maybe_single() \
        .execute()

    if not ub_res or ub_res.data is None:
        raise HTTPException(status_code=400, detail="Você precisa adicionar o livro antes de avaliar.")

    user_book_id = ub_res.data["id"]

    # Buscar review existente (seguro)
    existing_res = supabase.table("reviews") \
        .select("*") \
        .eq("user_book_id", user_book_id) \
        .maybe_single() \
        .execute()

    existing_data = existing_res.data if (existing_res and hasattr(existing_res, "data")) else None

    # Criar nova review
    if existing_data is None:
        inserted = supabase.table("reviews") \
            .insert({
                "user_book_id": user_book_id,
                "rating": rating,
                "comment": comment
            }) \
            .execute()

        if not inserted or not inserted.data:
            raise HTTPException(status_code=500, detail="Erro ao inserir review.")

        return inserted.data[0]

    # Atualizar review existente
    updated = supabase.table("reviews") \
        .update({
            "rating": rating,
            "comment": comment
        }) \
        .eq("id", existing_data["id"]) \
        .execute()

    if not updated or not updated.data:
        raise HTTPException(status_code=500, detail="Erro ao atualizar review.")

    return updated.data[0]


# ============================================================
# 2) APAGAR REVIEW
# ============================================================
@router.delete("/{book_id}")
def delete_review(book_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    ub_res = supabase.table("user_books") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("book_id", book_id) \
        .maybe_single() \
        .execute()

    if not ub_res or ub_res.data is None:
        raise HTTPException(status_code=404, detail="Review não encontrada.")

    supabase.table("reviews").delete().eq("user_book_id", ub_res.data["id"]).execute()
    return {"message": "Review removida com sucesso"}


# ============================================================
# 3) PEGAR REVIEW DO USUÁRIO
# ============================================================
@router.get("/my/{book_id}", response_model=ReviewResponse | None)
def get_my_review(book_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]

    ub_res = supabase.table("user_books") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("book_id", book_id) \
        .maybe_single() \
        .execute()

    if not ub_res or ub_res.data is None:
        return None

    rev_res = supabase.table("reviews") \
        .select("*") \
        .eq("user_book_id", ub_res.data["id"]) \
        .maybe_single() \
        .execute()

    if not rev_res or rev_res.data is None:
        return None

    return rev_res.data


# ============================================================
# 4) PEGAR TODAS AS REVIEWS PUBLICAS
# ============================================================
@router.get("/book/{book_id}")
def get_reviews_for_book(book_id: int):
    all_reviews = supabase.table("reviews").select("*").execute()

    if not all_reviews or not all_reviews.data:
        return []

    final = []

    for r in all_reviews.data:
        ub_res = supabase.table("user_books") \
            .select("user_id, book_id") \
            .eq("id", r["user_book_id"]) \
            .maybe_single() \
            .execute()

        if ub_res and ub_res.data and ub_res.data["book_id"] == book_id:
            final.append({
                "rating": r["rating"],
                "comment": r["comment"],
                "user_id": ub_res.data["user_id"]
            })

    return final
