# app/routes/auth_routes.py
from fastapi import APIRouter, HTTPException, Body
from app.database.supabase_client import supabase
from app.auth import verify_password, create_access_token

router = APIRouter()

@router.post("/login")
def login(user: dict = Body(...)):
    """
    Login de usuário. Espera um dict com 'email' e 'password'.
    Retorna um token JWT se o login for bem-sucedido.
    """
    email = user.get("email")
    password = user.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email e senha são obrigatórios")

    result = supabase.table("users").select("*").eq("email", email).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not verify_password(password, result.data["password_hash"]):
        raise HTTPException(status_code=401, detail="Senha incorreta")

    token = create_access_token({
        "user_id": result.data["id"],
        "email": result.data["email"]
    })

    return {"access_token": token}
