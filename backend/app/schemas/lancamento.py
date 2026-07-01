from pydantic import BaseModel
from typing import Optional, List

class LancamentoCreate(BaseModel):
    empresaId: str
    tipoImposto: str
    valor: float
    vencimento: str
    linkGuia: Optional[str] = None
    recorrente: Optional[bool] = False
    prazos: Optional[List[str]] = ["5", "2"]

class LancamentoUpdate(BaseModel):
    tipoImposto: Optional[str] = None
    valor: Optional[float] = None
    vencimento: Optional[str] = None
    linkGuia: Optional[str] = None
    recorrente: Optional[bool] = None
    status: Optional[str] = None

class LancamentoResponse(BaseModel):
    id: str
    empresaId: str
    tipoImposto: str
    valor: float
    vencimento: str
    linkGuia: Optional[str] = None
    pdfGuia: Optional[str] = None
    recorrente: bool
    prazos: str
    status: str

    class Config:
        from_attributes = True