from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.usuario import Usuario
from app.schemas.auth import CadastroRequest, LoginRequest
from app.core.security import hash_senha, verificar_senha, criar_access_token, criar_refresh_token, criar_reset_token, verificar_reset_token

def cadastrar_usuario(dados: CadastroRequest, db: Session) -> dict:
    # Verifica se e-mail já existe
    existente = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado"
        )

    # Cria o usuário
    usuario = Usuario(
        nome_completo=dados.nomeCompleto,
        nome_escritorio=dados.nomeEscritorio,
        email=dados.email,
        telefone=dados.telefone,
        assinatura=f"{dados.nomeEscritorio} | {dados.telefone}",
        senha_hash=hash_senha(dados.senha),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    # Gera tokens
    access_token = criar_access_token(usuario.id)
    refresh_token = criar_refresh_token(usuario.id)

    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome_completo,
            "email": usuario.email,
            "nomeEscritorio": usuario.nome_escritorio,
        }
    }

def login_usuario(dados: LoginRequest, db: Session) -> dict:
    # Busca o usuário
    usuario = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos"
        )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta desativada"
        )

    # Gera tokens
    access_token = criar_access_token(usuario.id)
    refresh_token = criar_refresh_token(usuario.id)

    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome_completo,
            "email": usuario.email,
            "nomeEscritorio": usuario.nome_escritorio,
        }
    }

def recuperar_senha(email: str, db: Session) -> dict:
    # Não confirma se o e-mail existe (segurança RF12)
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario:
        reset_token = criar_reset_token(str(usuario.id))
        # TODO: enviar e-mail com link contendo o token abaixo
        print(f"[DEV] Link de recuperação: http://localhost:3000/recuperar-senha/redefinir?token={reset_token}")
    return {"mensagem": "Se este e-mail estiver cadastrado, você receberá as instruções em breve."}

def redefinir_senha(token: str, senha: str, db: Session) -> dict:
    usuario_id = verificar_reset_token(token)
    if not usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )

    usuario.senha_hash = hash_senha(senha)
    db.commit()
    return {"mensagem": "Senha redefinida com sucesso"}