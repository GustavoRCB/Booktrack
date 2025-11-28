from app.database import SessionLocal
from app.database.supabase_client import SessionLocal


# Dependência padrão do FastAPI para obter sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
