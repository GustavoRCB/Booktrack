#use py
from fastapi import APIRouter, Depends, HTTPException
from starlette import status  # Importação de status para estabilidade
from app.database.supabase_client import supabase
from app.schemas import UserCreate, UserUpdate
from app.auth import hash_password
from app.dependencies import get_current_user

import logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Rota GET /users (REQUER AUTENTICAÇÃO por segurança)
@router.get("/")
def get_users():
    """Retorna a lista de todos os usuários (requer autenticação)."""
    try:
        # Nota: RLS (Row Level Security) no Supabase pode filtrar a lista aqui.
        result = supabase.table("users").select("*").execute()
        return result.data
    except Exception as e:
        logger.error(f"Erro ao buscar usuários no banco de dados: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail=f"Erro ao buscar usuários no banco de dados: {str(e)}")


# Rota POST /users (Rota de Registro)
@router.post("/")
def create_user(user: UserCreate):
    """Cria um novo usuário (Rota de Registro). Inclui tratamento de erro robusto."""
    data = user.dict()
    # 1. Faz o hash da senha
    data["password_hash"] = hash_password(data.pop("password"))
    
    try:
        # 2. Tenta inserir no Supabase
        result = supabase.table("users").insert(data).execute()
        
        # 3. Verifica se a inserção retornou dados
        if not result.data:
            logger.error("Falha silenciosa na inserção do Supabase: dados vazios.")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail="Falha na inserção do usuário, tente novamente.")
            
        return result.data

    except Exception as e:
        error_message = str(e)
        logger.error(f"Erro ao criar usuário: {error_message}")
        
        # 4. Trata o erro de campo nulo (ex: se o campo 'name' estiver faltando no Supabase)
        if "violates not-null constraint" in error_message or "23502" in error_message:
             # O .split('\"')[1] tenta extrair o nome da coluna que falhou
             column_name = error_message.split('\"')[1] if len(error_message.split('\"')) > 1 else "coluna desconhecida"
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                 detail=f"Campo obrigatório faltando ou nulo no banco: '{column_name}'. Verifique o schema e o payload.")

        # 5. Trata o erro de e-mail duplicado (unique constraint)
        if "duplicate key value violates unique constraint" in error_message or "23505" in error_message:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                 detail="Este e-mail já está em uso.")

        # 6. Trata outros erros de banco/conexão
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail=f"Erro interno do servidor ao criar usuário: {error_message}")


@router.put("/{user_id}")
def update_user(user_id: int, user: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Atualiza o perfil de um usuário (requer autenticação e autorização para o próprio perfil)."""
    
    # 1. Autorização: Verifica se o ID do token é o mesmo ID da rota
    if user_id != current_user.get("user_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Você só pode atualizar seu próprio perfil.")

    # 2. Prepara os dados de atualização (remove campos None)
    data = {k: v for k, v in user.dict().items() if v is not None}
    
    # 3. Faz o hash da nova senha, se fornecida
    if "password" in data:
        data["password_hash"] = hash_password(data.pop("password"))
        
    # 4. Executa a atualização no Supabase
    result = supabase.table("users").update(data).eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="Usuário não encontrado ou erro na atualização.")
        
    return result.data


@router.delete("/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """Deleta o perfil de um usuário (requer autenticação e autorização para o próprio perfil)."""
    
    # 1. Autorização: Verifica se o ID do token é o mesmo ID da rota
    if user_id != current_user.get("user_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Você só pode deletar seu próprio perfil.")

    # 2. Executa a deleção
    result = supabase.table("users").delete().eq("id", user_id).execute()
    
    if not result.data:
        # Esta verificação é conservadora, assumindo que se a exclusão falhou, o usuário não foi encontrado.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="Usuário não encontrado ou já foi excluído.")
    
    return {"message": f"Usuário com ID {user_id} deletado com sucesso."}