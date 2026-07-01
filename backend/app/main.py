from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import Base, engine
from app.routers import auth, empresas, lancamentos, whatsapp

# Cria as tabelas no banco
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="API do Sistema Inteligente de Lembretes Financeiros",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(empresas.router)
app.include_router(lancamentos.router)
app.include_router(whatsapp.router)

@app.get("/")
def raiz():
    return {"status": "ok", "app": settings.APP_NAME}