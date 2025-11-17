# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# importa os routers
from app.routes.users import router as users_router
from app.routes.books import router as books_router

app = FastAPI(
    title="BookTrack API",
    description="API para gerenciar usuários, livros, avaliações e progresso de leitura.",
    version="1.0.0"
)

# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# ROTA INICIAL
# ---------------------------
@app.get("/")
def root():
    return {"message": "🚀 API do BookTrack funcionando!"}

# ---------------------------
# REGISTRO DOS ROUTERS
# ---------------------------
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(books_router, prefix="/books", tags=["Books"])


