#authroutespy
from fastapi import APIRouter, HTTPException, Body
from app.database.supabase_client import supabase
from app.auth import verify_password, create_access_token

router = APIRouter()


@router.post("/login")
def login(user: dict = Body(...)):
    print("🔥 ROTA LOGIN FOI CHAMADA")
    print("📩 Dados recebidos:", user)

    email = user.get("email")
    password = user.get("password")

    try:
        result = supabase.table("users").select("*").eq("email", email).execute()
        print("📌 RESULTADO SUPABASE:", result)

        if not result.data:
            print("❌ Usuario não encontrado")
            return {"error": "usuario nao encontrado"}

        user_db = result.data[0]
        print("👤 Usuario encontrado:", user_db)

        if "password_hash" not in user_db:
            print("❌ Campo password_hash não existe")
            return {"error": "campo password_hash faltando"}

        print("🔐 Verificando senha...")
        valid = verify_password(password, user_db["password_hash"])
        print("🔑 Resultado da senha:", valid)

        if not valid:
            print("❌ Senha incorreta")
            return {"error": "senha incorreta"}

        token = create_access_token({"user_id": user_db["id"], "email": user_db["email"]})
        print("✅ TOKEN CRIADO:", token)

        return {"access_token": token, "token_type": "bearer"}

    except Exception as e:
        print("💥 ERRO GERAL:", e)
        raise
