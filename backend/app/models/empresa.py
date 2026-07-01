from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(String, ForeignKey("usuarios.id"), nullable=False)
    razao_social = Column(String, nullable=False)
    cnpj = Column(String, nullable=False)
    nome_responsavel = Column(String, nullable=False)
    whatsapp = Column(String, nullable=False)
    email = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())