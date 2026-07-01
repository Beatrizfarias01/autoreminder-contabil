from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Lancamento(Base):
    __tablename__ = "lancamentos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(String, ForeignKey("usuarios.id"), nullable=False)
    empresa_id = Column(String, ForeignKey("empresas.id"), nullable=False)
    tipo_imposto = Column(String, nullable=False)
    valor = Column(Float, nullable=False)
    vencimento = Column(String, nullable=False)
    link_guia = Column(String, nullable=True)
    pdf_guia = Column(String, nullable=True)
    recorrente = Column(Boolean, default=False)
    prazos = Column(String, default="5,2")
    status = Column(String, default="pendente")
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())