from fastapi import APIRouter, Depends, HTTPException, Header
from app.database.supabase_client import supabase
from app.schemas import UserCreate, UserUpdate
from app.auth import hash_password, verify_token

router = APIRouter()

def get_current_user(authorization: str = Header(...)):
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

    return payload


@router.get("/")
def get_users():
    return supabase.table("users").select("*").execute().data


@router.post("/")
def create_user(user: UserCreate):
    user_dict = user.dict()
    user_dict["password_hash"] = hash_password(user_dict.pop("password"))
    return supabase.table("users").insert(user_dict).execute().data


@router.put("/{user_id}")
def update_user(user_id: int, user: UserUpdate, current_user: dict = Depends(get_current_user)):
    user_dict = {k: v for k, v in user.dict().items() if v is not None}

    if "password" in user_dict:
        user_dict["password_hash"] = hash_password(user_dict.pop("password"))

    result = supabase.table("users").update(user_dict).eq("id", user_id).execute()

    return result.data


@router.delete("/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    result = supabase.table("users").delete().eq("id", user_id).execute()
    return {"deleted": result.data}
