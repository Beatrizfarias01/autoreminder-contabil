from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaResponse
from app.schemas.auth import MensagemResponse
from app.services.empresa_service import (
    listar_empresas,
    criar_empresa,
    buscar_empresa,
    atualizar_empresa,
    excluir_empresa,
)
from app.core.security import verificar_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException, status

security = HTTPBearer()

def get_usuario_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    usuario_id = verificar_token(credentials.credentials)
    if not usuario_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    return usuario_id

router = APIRouter(prefix="/empresas", tags=["Empresas"])

@router.get("/", response_model=List[EmpresaResponse])
def listar(usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    empresas = listar_empresas(usuario_id, db)
    return [EmpresaResponse(
        id=e.id,
        razaoSocial=e.razao_social,
        cnpj=e.cnpj,
        nomeResponsavel=e.nome_responsavel,
        whatsapp=e.whatsapp,
        email=e.email,
        ativo=e.ativo,
    ) for e in empresas]

@router.post("/", response_model=EmpresaResponse)
def criar(dados: EmpresaCreate, usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    e = criar_empresa(dados, usuario_id, db)
    return EmpresaResponse(
        id=e.id,
        razaoSocial=e.razao_social,
        cnpj=e.cnpj,
        nomeResponsavel=e.nome_responsavel,
        whatsapp=e.whatsapp,
        email=e.email,
        ativo=e.ativo,
    )

@router.get("/{empresa_id}", response_model=EmpresaResponse)
def buscar(empresa_id: str, usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    e = buscar_empresa(empresa_id, usuario_id, db)
    return EmpresaResponse(
        id=e.id,
        razaoSocial=e.razao_social,
        cnpj=e.cnpj,
        nomeResponsavel=e.nome_responsavel,
        whatsapp=e.whatsapp,
        email=e.email,
        ativo=e.ativo,
    )

@router.put("/{empresa_id}", response_model=EmpresaResponse)
def atualizar(empresa_id: str, dados: EmpresaUpdate, usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    e = atualizar_empresa(empresa_id, dados, usuario_id, db)
    return EmpresaResponse(
        id=e.id,
        razaoSocial=e.razao_social,
        cnpj=e.cnpj,
        nomeResponsavel=e.nome_responsavel,
        whatsapp=e.whatsapp,
        email=e.email,
        ativo=e.ativo,
    )

@router.delete("/{empresa_id}", response_model=MensagemResponse)
def excluir(empresa_id: str, usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    return excluir_empresa(empresa_id, usuario_id, db)