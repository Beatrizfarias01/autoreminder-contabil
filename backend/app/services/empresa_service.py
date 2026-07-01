from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.empresa import Empresa
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate

def listar_empresas(usuario_id: str, db: Session) -> list:
    return db.query(Empresa).filter(Empresa.usuario_id == usuario_id).all()

def criar_empresa(dados: EmpresaCreate, usuario_id: str, db: Session) -> Empresa:
    empresa = Empresa(
        usuario_id=usuario_id,
        razao_social=dados.razaoSocial,
        cnpj=dados.cnpj,
        nome_responsavel=dados.nomeResponsavel,
        whatsapp=dados.whatsapp,
        email=dados.email,
    )
    db.add(empresa)
    db.commit()
    db.refresh(empresa)
    return empresa

def buscar_empresa(empresa_id: str, usuario_id: str, db: Session) -> Empresa:
    empresa = db.query(Empresa).filter(
        Empresa.id == empresa_id,
        Empresa.usuario_id == usuario_id
    ).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    return empresa

def atualizar_empresa(empresa_id: str, dados: EmpresaUpdate, usuario_id: str, db: Session) -> Empresa:
    empresa = buscar_empresa(empresa_id, usuario_id, db)
    if dados.razaoSocial: empresa.razao_social = dados.razaoSocial
    if dados.nomeResponsavel: empresa.nome_responsavel = dados.nomeResponsavel
    if dados.whatsapp: empresa.whatsapp = dados.whatsapp
    if dados.email: empresa.email = dados.email
    if dados.ativo is not None: empresa.ativo = dados.ativo
    db.commit()
    db.refresh(empresa)
    return empresa

def excluir_empresa(empresa_id: str, usuario_id: str, db: Session) -> dict:
    empresa = buscar_empresa(empresa_id, usuario_id, db)
    db.delete(empresa)
    db.commit()
    return {"mensagem": "Empresa excluída com sucesso"}