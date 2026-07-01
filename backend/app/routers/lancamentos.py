from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import aiofiles
from app.database import get_db
from app.schemas.lancamento import LancamentoCreate, LancamentoUpdate, LancamentoResponse
from app.schemas.auth import MensagemResponse
from app.services.lancamento_service import (
    listar_lancamentos,
    criar_lancamento,
    buscar_lancamento,
    atualizar_lancamento,
    cancelar_lancamento,
)
from app.core.security import verificar_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse

security = HTTPBearer()

def get_usuario_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    usuario_id = verificar_token(credentials.credentials)
    if not usuario_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    return usuario_id

router = APIRouter(prefix="/lancamentos", tags=["Lançamentos"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[LancamentoResponse])
def listar(usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    lancamentos = listar_lancamentos(usuario_id, db)
    return [LancamentoResponse(
        id=l.id,
        empresaId=l.empresa_id,
        tipoImposto=l.tipo_imposto,
        valor=l.valor,
        vencimento=l.vencimento,
        linkGuia=l.link_guia,
        pdfGuia=l.pdf_guia,
        recorrente=l.recorrente,
        prazos=l.prazos,
        status=l.status,
    ) for l in lancamentos]

@router.post("/", response_model=LancamentoResponse)
async def criar(
    empresaId: str = Form(...),
    tipoImposto: str = Form(...),
    valor: float = Form(...),
    vencimento: str = Form(...),
    linkGuia: Optional[str] = Form(None),
    recorrente: bool = Form(False),
    prazos: str = Form("5,2"),
    pdf: Optional[UploadFile] = File(None),
    usuario_id: str = Depends(get_usuario_id),
    db: Session = Depends(get_db)
):
    pdf_path = None
    if pdf and pdf.filename:
        ext = os.path.splitext(pdf.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, 'wb') as f:
            content = await pdf.read()
            await f.write(content)
        pdf_path = filename

    from app.schemas.lancamento import LancamentoCreate
    dados = LancamentoCreate(
        empresaId=empresaId,
        tipoImposto=tipoImposto,
        valor=valor,
        vencimento=vencimento,
        linkGuia=linkGuia,
        recorrente=recorrente,
        prazos=prazos.split(","),
    )

    l = criar_lancamento(dados, usuario_id, db)
    
    if pdf_path:
        l.pdf_guia = pdf_path
        db.commit()
        db.refresh(l)

    return LancamentoResponse(
        id=l.id,
        empresaId=l.empresa_id,
        tipoImposto=l.tipo_imposto,
        valor=l.valor,
        vencimento=l.vencimento,
        linkGuia=l.link_guia,
        pdfGuia=l.pdf_guia,
        recorrente=l.recorrente,
        prazos=l.prazos,
        status=l.status,
    )

@router.get("/{lancamento_id}", response_model=LancamentoResponse)
def buscar(lancamento_id: str, usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    l = buscar_lancamento(lancamento_id, usuario_id, db)
    return LancamentoResponse(
        id=l.id,
        empresaId=l.empresa_id,
        tipoImposto=l.tipo_imposto,
        valor=l.valor,
        vencimento=l.vencimento,
        linkGuia=l.link_guia,
        pdfGuia=l.pdf_guia,
        recorrente=l.recorrente,
        prazos=l.prazos,
        status=l.status,
    )

@router.put("/{lancamento_id}", response_model=LancamentoResponse)
def atualizar(lancamento_id: str, dados: LancamentoUpdate, usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    l = atualizar_lancamento(lancamento_id, dados, usuario_id, db)
    return LancamentoResponse(
        id=l.id,
        empresaId=l.empresa_id,
        tipoImposto=l.tipo_imposto,
        valor=l.valor,
        vencimento=l.vencimento,
        linkGuia=l.link_guia,
        pdfGuia=l.pdf_guia,
        recorrente=l.recorrente,
        prazos=l.prazos,
        status=l.status,
    )

@router.delete("/{lancamento_id}", response_model=MensagemResponse)
def cancelar(lancamento_id: str, usuario_id: str = Depends(get_usuario_id), db: Session = Depends(get_db)):
    return cancelar_lancamento(lancamento_id, usuario_id, db)

@router.get("/pdf/{filename}")
def baixar_pdf(filename: str, usuario_id: str = Depends(get_usuario_id)):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(filepath, media_type="application/pdf")