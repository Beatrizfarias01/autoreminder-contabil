from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.lancamento import Lancamento
from app.models.empresa import Empresa
from app.models.usuario import Usuario
from app.services.whatsapp_service import enviar_lembrete_vencimento, enviar_mensagem
from app.core.security import verificar_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
import os

security = HTTPBearer()

def get_usuario_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    usuario_id = verificar_token(credentials.credentials)
    if not usuario_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    return usuario_id

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

class EnviarLembreteRequest(BaseModel):
    lancamento_id: str

class EnviarMensagemRequest(BaseModel):
    telefone: str
    mensagem: str

@router.post("/enviar-lembrete")
async def enviar_lembrete(
    dados: EnviarLembreteRequest,
    usuario_id: str = Depends(get_usuario_id),
    db: Session = Depends(get_db)
):
    try:
        lancamento = db.query(Lancamento).filter(
            Lancamento.id == dados.lancamento_id,
            Lancamento.usuario_id == usuario_id
        ).first()
        if not lancamento:
            raise HTTPException(status_code=404, detail="Lançamento não encontrado")

        empresa = db.query(Empresa).filter(Empresa.id == lancamento.empresa_id).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa não encontrada")

        contador = db.query(Usuario).filter(Usuario.id == usuario_id).first()

        try:
            data_vencimento = datetime.strptime(lancamento.vencimento, "%Y-%m-%d")
            dias_restantes = (data_vencimento - datetime.now()).days
        except Exception:
            dias_restantes = 0

        # Monta o caminho do PDF se existir
        pdf_path = None
        if lancamento.pdf_guia:
            pdf_path = os.path.join("uploads", lancamento.pdf_guia)

        resultado = await enviar_lembrete_vencimento(
            telefone=empresa.whatsapp,
            nome_cliente=empresa.nome_responsavel,
            tipo_imposto=lancamento.tipo_imposto,
            valor=lancamento.valor,
            vencimento=lancamento.vencimento,
            nome_escritorio=contador.nome_escritorio if contador else "Escritório",
            dias_restantes=dias_restantes,
            link_guia=lancamento.link_guia,
            pdf_path=pdf_path,
        )

        lancamento.status = "enviado"
        db.commit()

        return {"mensagem": "Lembrete enviado com sucesso!", "resultado": resultado}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enviar-mensagem")
async def enviar_msg_direta(
    dados: EnviarMensagemRequest,
    usuario_id: str = Depends(get_usuario_id),
):
    resultado = await enviar_mensagem(dados.telefone, dados.mensagem)
    return {"mensagem": "Mensagem enviada!", "resultado": resultado}