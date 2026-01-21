# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

# ================================
# 🚀 FASTAPI INIT
# ================================
app = FastAPI(
    title="BookTrack API",
    description="API para gerenciar usuários, livros, avaliações e progresso de leitura.",
    version="1.0.0"
)

# ================================
# 🌐 CORS (CORRIGIDO PARA RAILWAY + FRONTEND)
# ================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 permite frontend local e Vercel
    allow_credentials=False,  # ⚠️ obrigatório quando allow_origins="*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# 🌍 ROOT / HEALTH
# ================================
@app.get("/")
def root():
    return {"status": "ok", "message": "BookTrack API funcionando"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ================================
# 📌 ROUTERS (IMPORT APÓS APP)
# ================================
from app.routes.users import router as users_router
from app.routes.auth_routes import router as auth_router
from app.routes.public_books import router as public_books_router
from app.routes.user_books import router as user_books_router
from app.routes.external_books import router as external_books_router
from app.routes.profile import router as profile_router
from app.routes.reviews import router as reviews_router
from app.routes.avatar import router as avatar_router
from app.routes.favorites import router as favorites_router
from app.routes.site_stats import router as site_stats_router

app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(public_books_router, prefix="/public-books")
app.include_router(user_books_router)
app.include_router(external_books_router)
app.include_router(profile_router, prefix="/profile")
app.include_router(avatar_router, prefix="/profile")
app.include_router(favorites_router, prefix="/profile")
app.include_router(reviews_router, prefix="/reviews")
app.include_router(site_stats_router)

# ================================
# 📘 OPENAPI (JWT)
# ================================
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    openapi_schema.setdefault("components", {})
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    for path, path_item in openapi_schema.get("paths", {}).items():
        if not path.startswith(("/auth", "/stats", "/health", "/")):
            for method in path_item.values():
                method.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
