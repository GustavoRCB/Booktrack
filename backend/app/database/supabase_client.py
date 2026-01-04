# app/database/supabase_client.py
from supabase import create_client, Client
import os

_supabase: Client | None = None


def get_supabase() -> Client:
    """
    Inicializa o cliente Supabase somente quando necessário (lazy init).
    Evita falhas no startup do FastAPI em produção.
    """
    global _supabase

    if _supabase is None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")

        if not supabase_url or not supabase_key:
            raise RuntimeError(
                "SUPABASE_URL ou SUPABASE_KEY não configurados nas Environment Variables"
            )

        _supabase = create_client(supabase_url, supabase_key)

    return _supabase
