import httpx
import base64
import os
from app.core.config import settings

BASE_URL = settings.EVOLUTION_API_URL
INSTANCE = settings.EVOLUTION_INSTANCE
API_KEY = settings.EVOLUTION_API_KEY

HEADERS = {
    "apikey": API_KEY,
    "Content-Type": "application/json",
}

async def enviar_mensagem(telefone: str, mensagem: str) -> dict:
    numero = telefone.replace("(", "").replace(")", "").replace("-", "").replace(" ", "")
    if not numero.startswith("55"):
        numero = f"55{numero}"

    url = f"{BASE_URL}/message/sendText/{INSTANCE}"
    payload = {
        "number": numero,
        "textMessage": {"text": mensagem},
        "options": {"delay": 1000, "presence": "composing"}
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=HEADERS)
        return response.json()

async def enviar_pdf(telefone: str, pdf_path: str, nome_arquivo: str, caption: str = "") -> dict:
    numero = telefone.replace("(", "").replace(")", "").replace("-", "").replace(" ", "")
    if not numero.startswith("55"):
        numero = f"55{numero}"

    # Lê o PDF e converte para base64
    with open(pdf_path, "rb") as f:
        pdf_base64 = base64.b64encode(f.read()).decode("utf-8")

    url = f"{BASE_URL}/message/sendMedia/{INSTANCE}"
    payload = {
        "number": numero,
        "mediaMessage": {
            "mediatype": "document",
            "fileName": nome_arquivo,
            "caption": caption,
            "media": pdf_base64,
        },
        "options": {"delay": 1000}
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=HEADERS)
        return response.json()

async def enviar_lembrete_vencimento(
    telefone: str,
    nome_cliente: str,
    tipo_imposto: str,
    valor: float,
    vencimento: str,
    nome_escritorio: str,
    dias_restantes: int,
    link_guia: str = None,
    pdf_path: str = None,
) -> dict:
    if dias_restantes > 0:
        urgencia = f"vence em *{dias_restantes} dia{'s' if dias_restantes > 1 else ''}* ({vencimento})"
        emoji = "⏰" if dias_restantes <= 2 else "👋"
    elif dias_restantes == 0:
        urgencia = f"vence *hoje* ({vencimento})"
        emoji = "⚠️"
    else:
        urgencia = f"venceu em {vencimento} (*{abs(dias_restantes)} dia{'s' if abs(dias_restantes) > 1 else ''} atrás*)"
        emoji = "🚨"

    mensagem = (
        f"{emoji} Olá, *{nome_cliente}*!\n\n"
        f"Passando para lembrar que o seu *{tipo_imposto}* {urgencia}.\n\n"
        f"💰 Valor: *R$ {valor:.2f}*\n\n"
    )

    if link_guia:
        mensagem += f"🔗 Link da guia: {link_guia}\n\n"

    mensagem += (
        f"Qualquer dúvida, estamos à disposição!\n"
        f"— _{nome_escritorio}_"
    )

    # Envia a mensagem de texto
    resultado = await enviar_mensagem(telefone, mensagem)

    # Envia o PDF se existir
    if pdf_path and os.path.exists(pdf_path):
        await enviar_pdf(
            telefone=telefone,
            pdf_path=pdf_path,
            nome_arquivo=f"guia_{tipo_imposto}_{vencimento}.pdf",
            caption=f"📄 Guia {tipo_imposto} - {vencimento}"
        )

    return resultado