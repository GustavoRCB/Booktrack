# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.supabase_client import supabase

app = FastAPI(
    title="BookTrack API",
    description="API para gerenciar usuários, livros, avaliações e progresso de leitura.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota inicial
@app.get("/")
def root():
    return {"message": "🚀 API do BookTrack funcionando!"}

# Rota exemplo
@app.get("/books")
def get_books():
    return [
        {"id": 1, "title": "1984", "author": "George Orwell"},
        {"id": 2, "title": "O Senhor dos Anéis", "author": "J.R.R. Tolkien"}
    ]

# 🔥 Teste de banco de dados Supabase
@app.get("/test-db")
def test_db():
    response = supabase.table("books").select("*").execute()
    return response.data
