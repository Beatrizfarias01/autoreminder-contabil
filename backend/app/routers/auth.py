from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    CadastroRequest,
    LoginRequest,
    RecuperarSenhaRequest,
    RedefinirSenhaRequest,
    AuthResponse,
    MensagemResponse,
)
from app.services.auth_service import (
    cadastrar_usuario,
    login_usuario,
    recuperar_senha,
    redefinir_senha,
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/cadastro", response_model=AuthResponse)
def cadastro(dados: CadastroRequest, db: Session = Depends(get_db)):
    return cadastrar_usuario(dados, db)

@router.post("/login", response_model=AuthResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    return login_usuario(dados, db)

@router.post("/recuperar-senha", response_model=MensagemResponse)
def recuperar(dados: RecuperarSenhaRequest, db: Session = Depends(get_db)):
    return recuperar_senha(dados.email, db)

@router.post("/redefinir-senha", response_model=MensagemResponse)
def redefinir(dados: RedefinirSenhaRequest, db: Session = Depends(get_db)):
    return redefinir_senha(dados.token, dados.senha, db)

@router.post("/logout", response_model=MensagemResponse)
def logout():
    return {"mensagem": "Logout realizado com sucesso"}