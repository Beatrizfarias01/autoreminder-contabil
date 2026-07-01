from pydantic import BaseModel, EmailStr
from typing import Optional

class EmpresaCreate(BaseModel):
    razaoSocial: str
    cnpj: str
    nomeResponsavel: str
    whatsapp: str
    email: EmailStr

class EmpresaUpdate(BaseModel):
    razaoSocial: Optional[str] = None
    nomeResponsavel: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[EmailStr] = None
    ativo: Optional[bool] = None

class EmpresaResponse(BaseModel):
    id: str
    razaoSocial: str
    cnpj: str
    nomeResponsavel: str
    whatsapp: str
    email: str
    ativo: bool

    class Config:
        from_attributes = True