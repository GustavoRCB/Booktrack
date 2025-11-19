# app/database/supabase_client.py
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

# Configuração de logging
logger = logging.getLogger(__name__)

# Carregar variáveis do arquivo .env
# load_dotenv() deve ser chamada na raiz do projeto (app/main.py) ou aqui
# Se estiver tendo problemas de carregamento, chame explicitamente:
load_dotenv() 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client | None = None

# Tratamento de erro para inicialização do cliente Supabase
try:
    if not SUPABASE_URL or not SUPABASE_KEY:
        # Se as chaves estiverem faltando, levanta um erro, mas o logger captura
        raise ValueError("❌ SUPABASE_URL ou SUPABASE_KEY não configurados no arquivo .env")
        
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Cliente Supabase inicializado com sucesso.")

except ValueError as e:
    # Captura o erro, loga e permite que o servidor inicie com 'supabase' como None
    logger.error(f"🚨 ERRO CRÍTICO NA CONEXÃO SUPABASE: {e}")
    logger.warning("Servidor Uvicorn iniciando, mas sem conexão funcional com o banco de dados Supabase.")
    logger.warning("Verifique o arquivo .env e certifique-se de que SUPABASE_URL e SUPABASE_KEY estão corretos.")

# Opcional: Se quiser que o servidor trave para forçar a correção do .env, use o código abaixo:
# if not SUPABASE_URL or not SUPABASE_KEY:
#     raise ValueError("❌ SUPABASE_URL ou SUPABASE_KEY não configurados no arquivo .env")
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)