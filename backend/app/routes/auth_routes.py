from fastapi import APIRouter, HTTPException, Body
from app.database.supabase_client import supabase
from app.auth import verify_password, create_access_token

router = APIRouter()

"""
#@router.post("/login")
def login(user: dict = Body(...)):
    email = user.get("email")
    password = user.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email e senha são obrigatórios")

    # Busca SEM .single() — porque single() quebra se nada é encontrado!
    result = supabase.table("users").select("*").eq("email", email).execute()

    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user_db = result.data[0]

    # Verifica existência da coluna
    if "password_hash" not in user_db:
        raise HTTPException(status_code=500, detail="Coluna password_hash não existe no banco")

    # Verifica senha
    if not verify_password(password, user_db["password_hash"]):
        raise HTTPException(status_code=401, detail="Senha incorreta")

    token = create_access_token({
        "user_id": user_db["id"],
        "email": user_db["email"]
    })

    return {"access_token": token, "token_type": "bearer"}#

"""

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
