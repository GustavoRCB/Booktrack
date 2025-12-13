from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.dependencies import get_current_user
from app.database.supabase_client import supabase
import uuid

router = APIRouter(tags=["Avatar"])


@router.post("/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # aceita apenas imagens
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Arquivo deve ser uma imagem."
        )

    # nome único do arquivo
    filename = f"{user_id}_{uuid.uuid4()}.png"

    # upload para o bucket "avatars"
    supabase.storage.from_("avatars").upload(
        filename,
        file.file,
        file_options={"content-type": file.content_type}
    )

    # gerar URL pública
    public_url = supabase.storage.from_("avatars").get_public_url(filename)

    # salvar URL no usuário
    supabase.table("users") \
        .update({"avatar_url": public_url}) \
        .eq("id", user_id) \
        .execute()

    return {"avatar_url": public_url}
