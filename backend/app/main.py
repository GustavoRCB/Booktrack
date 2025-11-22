# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

# ROTAS EXISTENTES
from app.routes.users import router as users_router

from app.routes.auth_routes import router as auth_router

# ⬇️ NOVAS ROTAS
from app.routes.public_books import router as public_books_router
from app.routes.user_books import router as user_books_router

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

@app.get("/")
def root():
    return {"message": "API funcionando!"}

# ----------------------
# REGISTRO DAS ROTAS
# ----------------------
app.include_router(auth_router,       prefix="/auth",        tags=["Auth"])
app.include_router(users_router,      prefix="/users",       tags=["Users"])


# ⬇️ novas rotas
app.include_router(public_books_router, prefix="/public-books", tags=["Public Books"])
app.include_router(user_books_router,   prefix="/user/books",  tags=["User Books"])

# ----------------------
# OPENAPI PERSONALIZADO
# ----------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # esquema de segurança JWT
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # aplica JWT em tudo exceto /auth
    for path, path_item in openapi_schema.get("paths", {}).items():
        if not path.startswith("/auth"):
            for method in path_item.values():
                method.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

