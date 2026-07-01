from pydantic import BaseModel, EmailStr
from typing import Optional

class CadastroRequest(BaseModel):
    nomeCompleto: str
    nomeEscritorio: str
    email: EmailStr
    telefone: str
    senha: str

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str
    lembrar: Optional[bool] = False

class RecuperarSenhaRequest(BaseModel):
    email: EmailStr

class RedefinirSenhaRequest(BaseModel):
    token: str
    senha: str

class UsuarioResponse(BaseModel):
    id: str
    nome: str
    email: str
    nomeEscritorio: str

class AuthResponse(BaseModel):
    accessToken: str
    refreshToken: str
    usuario: UsuarioResponse

class MensagemResponse(BaseModel):
    mensagem: str