from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome_completo = Column(String, nullable=False)
    nome_escritorio = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    telefone = Column(String, nullable=False)
    assinatura = Column(String, nullable=True)
    senha_hash = Column(String, nullable=False)
    email_verificado = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())