from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.lancamento import Lancamento
from app.schemas.lancamento import LancamentoCreate, LancamentoUpdate

def listar_lancamentos(usuario_id: str, db: Session) -> list:
    return db.query(Lancamento).filter(Lancamento.usuario_id == usuario_id).all()

def criar_lancamento(dados: LancamentoCreate, usuario_id: str, db: Session) -> Lancamento:
    lancamento = Lancamento(
        usuario_id=usuario_id,
        empresa_id=dados.empresaId,
        tipo_imposto=dados.tipoImposto,
        valor=dados.valor,
        vencimento=dados.vencimento,
        link_guia=dados.linkGuia,
        recorrente=dados.recorrente,
        prazos=",".join(dados.prazos) if dados.prazos else "5,2",
        status="pendente",
    )
    db.add(lancamento)
    db.commit()
    db.refresh(lancamento)
    return lancamento

def buscar_lancamento(lancamento_id: str, usuario_id: str, db: Session) -> Lancamento:
    lancamento = db.query(Lancamento).filter(
        Lancamento.id == lancamento_id,
        Lancamento.usuario_id == usuario_id
    ).first()
    if not lancamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lançamento não encontrado"
        )
    return lancamento

def atualizar_lancamento(lancamento_id: str, dados: LancamentoUpdate, usuario_id: str, db: Session) -> Lancamento:
    lancamento = buscar_lancamento(lancamento_id, usuario_id, db)
    if dados.tipoImposto: lancamento.tipo_imposto = dados.tipoImposto
    if dados.valor: lancamento.valor = dados.valor
    if dados.vencimento: lancamento.vencimento = dados.vencimento
    if dados.linkGuia: lancamento.link_guia = dados.linkGuia
    if dados.recorrente is not None: lancamento.recorrente = dados.recorrente
    if dados.status: lancamento.status = dados.status
    db.commit()
    db.refresh(lancamento)
    return lancamento

def cancelar_lancamento(lancamento_id: str, usuario_id: str, db: Session) -> dict:
    lancamento = buscar_lancamento(lancamento_id, usuario_id, db)
    db.delete(lancamento)
    db.commit()
    return {"mensagem": "Lançamento cancelado com sucesso"}