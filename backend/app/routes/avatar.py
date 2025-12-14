from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.dependencies import get_current_user
from app.database.supabase_client import supabase
import uuid

router = APIRouter()

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    ext = file.filename.split(".")[-1]
    filename = f"{user_id}_{uuid.uuid4()}.{ext}"

    try:
        supabase.storage.from_("avatars").upload(
            path=filename,
            file=file_bytes,
            file_options={"contentType": file.content_type}
        )
    except Exception as e:
        print("ERRO STORAGE:", e)
        raise HTTPException(status_code=500, detail="Erro no upload do avatar")

    public_url = supabase.storage.from_("avatars").get_public_url(filename)

    supabase.table("users") \
        .update({"avatar_url": public_url}) \
        .eq("id", user_id) \
        .execute()

    return {
        "message": "Avatar atualizado com sucesso",
        "avatar_url": public_url
    }
