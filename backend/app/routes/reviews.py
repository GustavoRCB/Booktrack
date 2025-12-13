from fastapi import APIRouter, Depends, HTTPException
from app.database.supabase_client import supabase
from app.dependencies import get_current_user
from app.schemas import ReviewCreate, ReviewResponse

router = APIRouter(tags=["Reviews"])


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

    if not (1 <= review_data.rating <= 5):
        raise HTTPException(400, "Rating deve ser entre 1 e 5")

    ub_res = (
        supabase.table("user_books")
        .select("id")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .maybe_single()
        .execute()
    )

    if not ub_res or not ub_res.data:
        raise HTTPException(
            status_code=400,
            detail="Você precisa adicionar o livro antes de avaliar"
        )

    user_book_id = ub_res.data["id"]

    rev_res = (
        supabase.table("reviews")
        .select("id")
        .eq("user_book_id", user_book_id)
        .maybe_single()
        .execute()
    )

    if rev_res and rev_res.data:
        res = (
            supabase.table("reviews")
            .update({
                "rating": review_data.rating,
                "comment": review_data.comment
            })
            .eq("id", rev_res.data["id"])
            .execute()
        )
    else:
        res = (
            supabase.table("reviews")
            .insert({
                "user_book_id": user_book_id,
                "rating": review_data.rating,
                "comment": review_data.comment
            })
            .execute()
        )

    return res.data[0]


# ============================================================
# 2) APAGAR REVIEW
# ============================================================
@router.delete("/{book_id}")
def delete_review(
    book_id: int,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    ub_res = (
        supabase.table("user_books")
        .select("id")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .maybe_single()
        .execute()
    )

    if not ub_res or not ub_res.data:
        raise HTTPException(404, "Review não encontrada")

    supabase.table("reviews").delete().eq(
        "user_book_id", ub_res.data["id"]
    ).execute()

    return {"message": "Review removida com sucesso"}


# ============================================================
# 3) PEGAR REVIEW DO USUÁRIO
# ============================================================
@router.get("/my/{book_id}", response_model=ReviewResponse | None)
def get_my_review(
    book_id: int,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    ub_res = (
        supabase.table("user_books")
        .select("id")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .maybe_single()
        .execute()
    )

    if not ub_res or not ub_res.data:
        return None

    rev_res = (
        supabase.table("reviews")
        .select("*")
        .eq("user_book_id", ub_res.data["id"])
        .maybe_single()
        .execute()
    )

    if not rev_res or not rev_res.data:
        return None

    return rev_res.data


# ============================================================
# 4) PEGAR REVIEWS PÚBLICAS DO LIVRO
# ============================================================
@router.get("/book/{book_id}")
def get_reviews_for_book(book_id: int):
    res = (
        supabase
        .table("reviews")
        .select("""
            rating,
            comment,
            user_books!inner (
                user_id,
                book_id
            )
        """)
        .eq("user_books.book_id", book_id)
        .execute()
    )

    if not res or not res.data:
        return []

    return [
        {
            "rating": r["rating"],
            "comment": r["comment"],
            "user_id": r["user_books"]["user_id"]
        }
        for r in res.data
    ]
