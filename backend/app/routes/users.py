# app/routes/users.py

from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from app.database.supabase_client import get_supabase
from app.schemas import UserCreate, UserUpdate
from app.auth import hash_password
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


# ==============================
# GET /users
# ==============================
@router.get("/")
def get_users(current_user: dict = Depends(get_current_user)):
    """Retorna a lista de usuários (requer autenticação)."""
    try:
        supabase = get_supabase()
        result = supabase.table("users").select("*").execute()
        return result.data

    except Exception as e:
        logger.exception("Erro ao buscar usuários")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar usuários no banco de dados",
        )


# ==============================
# POST /users (registro)
# ==============================
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    """Cria um novo usuário."""
    data = user.model_dump()

    # Hash da senha
    data["password_hash"] = hash_password(data.pop("password"))

    try:
        supabase = get_supabase()
        result = supabase.table("users").insert(data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Falha ao criar usuário",
            )

        return result.data

    except Exception as e:
        error_message = str(e)
        logger.error(f"Erro ao criar usuário: {error_message}")

        if "23505" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este e-mail já está em uso",
            )

        if "23502" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campo obrigatório ausente",
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao criar usuário",
        )


# ==============================
# PUT /users/{user_id}
# ==============================
@router.put("/{user_id}")
def update_user(
    user_id: int,
    user: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Atualiza o próprio perfil."""
    if user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode atualizar seu próprio perfil",
        )

    data = {k: v for k, v in user.model_dump().items() if v is not None}

    if "password" in data:
        data["password_hash"] = hash_password(data.pop("password"))

    try:
        supabase = get_supabase()
        result = (
            supabase.table("users")
            .update(data)
            .eq("id", user_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado",
            )

        return result.data

    except Exception:
        logger.exception("Erro ao atualizar usuário")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar usuário",
        )


# ==============================
# DELETE /users/{user_id}
# ==============================
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Remove o próprio perfil."""
    if user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode deletar seu próprio perfil",
        )

    try:
        supabase = get_supabase()
        result = (
            supabase.table("users")
            .delete()
            .eq("id", user_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado",
            )

        return {"message": "Usuário deletado com sucesso"}

    except Exception:
        logger.exception("Erro ao deletar usuário")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao deletar usuário",
        )
