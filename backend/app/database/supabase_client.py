# app/database/supabase_client.py

from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

# ======================================================
# Carrega .env apenas em ambiente local
# ======================================================
if os.getenv("ENV") != "production":
    load_dotenv()

def get_supabase() -> Client:
    """
    Cria um NOVO cliente Supabase por chamada.

    ✔ Compatível com versões antigas do supabase-py
    ✔ Evita reutilização de conexões quebradas
    ✔ Corrige Server disconnected
    """

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        logger.critical("❌ SUPABASE_URL ou SUPABASE_KEY não configurados")
        raise RuntimeError("Variáveis do Supabase ausentes")

    try:
        return create_client(supabase_url, supabase_key)

    except Exception as e:
        logger.exception("🚨 Erro ao criar cliente Supabase")
        raise RuntimeError("Erro ao conectar com o Supabase") from e
