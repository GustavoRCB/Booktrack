# auth_routes.py
from fastapi import APIRouter, HTTPException, Body
from app.database.supabase_client import get_supabase
from app.auth import verify_password, create_access_token

router = APIRouter()


@router.post("/login")
def login(user: dict = Body(...)):
    supabase = get_supabase()  # ✅ inicialização segura

    print("🔥 ROTA LOGIN FOI CHAMADA")
    print("📩 Dados recebidos:", user)

    email = user.get("email")
    password = user.get("password")

    try:
        result = (
            supabase
            .table("users")
            .select("*")
            .eq("email", email)
            .execute()
        )

        print("📌 RESULTADO SUPABASE:", result)

        if not result.data:
            print("❌ Usuario não encontrado")
            raise HTTPException(
                status_code=401,
                detail="Usuário ou senha inválidos"
            )

        user_db = result.data[0]
        print("👤 Usuario encontrado:", user_db)

        if "password_hash" not in user_db:
            print("❌ Campo password_hash não existe")
            raise HTTPException(
                status_code=500,
                detail="Usuário sem senha configurada"
            )

        print("🔐 Verificando senha...")
        valid = verify_password(password, user_db["password_hash"])
        print("🔑 Resultado da senha:", valid)

        if not valid:
            print("❌ Senha incorreta")
            raise HTTPException(
                status_code=401,
                detail="Usuário ou senha inválidos"
            )

        token = create_access_token({
            "user_id": user_db["id"],
            "email": user_db["email"]
        })

        print("✅ TOKEN CRIADO")

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        print("💥 ERRO GERAL:", e)
        raise HTTPException(
            status_code=500,
            detail="Erro interno no login"
        )
