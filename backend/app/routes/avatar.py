from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.dependencies import get_current_user
from app.database.supabase_client import supabase
import uuid

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.post("/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # só aceita imagens
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Arquivo deve ser uma imagem.")

    # nome único
    filename = f"{user_id}_{uuid.uuid4()}.png"

    # upload para o bucket avatars
    supabase.storage.from_("avatars").upload(
        filename,
        file.file,
        file_options={"content-type": file.content_type}
    )

    # url pública
    url = supabase.storage.from_("avatars").get_public_url(filename)

    # salvar no usuário
    supabase.table("users").update({"avatar_url": url}).eq("id", user_id).execute()

    return {"avatar_url": url}
