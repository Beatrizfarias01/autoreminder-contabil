from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from app.core.config import settings

ph = PasswordHasher()

def hash_senha(senha: str) -> str:
    return ph.hash(senha)

def verificar_senha(senha: str, hash: str) -> bool:
    try:
        return ph.verify(hash, senha)
    except VerifyMismatchError:
        return False

def criar_token(dados: dict, expira_em: Optional[timedelta] = None) -> str:
    payload = dados.copy()
    expira = datetime.utcnow() + (expira_em or timedelta(minutes=15))
    payload.update({"exp": expira})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def criar_access_token(usuario_id: str) -> str:
    return criar_token(
        {"sub": usuario_id, "tipo": "access"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

def criar_refresh_token(usuario_id: str) -> str:
    return criar_token(
        {"sub": usuario_id, "tipo": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

def criar_reset_token(usuario_id: str) -> str:
    return criar_token(
        {"sub": usuario_id, "tipo": "reset"},
        timedelta(hours=1)
    )

def verificar_reset_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("tipo") != "reset":
            return None
        return payload.get("sub")
    except JWTError:
        return None

def verificar_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None