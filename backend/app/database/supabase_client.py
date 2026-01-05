# app/database/supabase_client.py

from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

# ======================================================
# Configuração básica de logging
# ======================================================
logger = logging.getLogger(__name__)

# ======================================================
# Carrega .env APENAS em ambiente local
# (No Render/Vercel as vars vêm do dashboard)
# ======================================================
if os.getenv("ENV") != "production":
    load_dotenv()

# ======================================================
# Cliente Supabase (lazy init)
# ======================================================
_supabase: Client | None = None


def get_supabase() -> Client:
    """
    Retorna o cliente Supabase usando lazy initialization.

    - Evita crash no startup do FastAPI
    - Compatível com Render / Vercel
    - Inicializa somente quando a rota precisar
    """

    global _supabase

    if _supabase is not None:
        return _supabase

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        logger.critical(
            "❌ SUPABASE_URL ou SUPABASE_KEY não configurados nas Environment Variables"
        )
        raise RuntimeError(
            "SUPABASE_URL ou SUPABASE_KEY não configurados"
        )

    try:
        _supabase = create_client(supabase_url, supabase_key)
        logger.info("✅ Cliente Supabase inicializado com sucesso")
        return _supabase

    except Exception as e:
        logger.exception("🚨 Falha ao inicializar cliente Supabase")
        raise RuntimeError("Erro ao conectar com o Supabase") from e
