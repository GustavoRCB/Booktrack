# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Cria a aplicação FastAPI
app = FastAPI(
    title="BookTrack API",
    description="API para gerenciar usuários, livros, avaliações e progresso de leitura.",
    version="1.0.0"
)

# Configura o CORS (permite que o frontend acesse a API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # você pode restringir depois (ex: ["http://localhost:5173"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota inicial (teste)
@app.get("/")
def read_root():
    return {"message": "🚀 API do BookTrack está no ar!"}

# Exemplo de rota de livros (será substituída depois)
@app.get("/books")
def get_books():
    return [
        {"id": 1, "title": "1984", "author": "George Orwell"},
        {"id": 2, "title": "O Senhor dos Anéis", "author": "J.R.R. Tolkien"},
    ]
