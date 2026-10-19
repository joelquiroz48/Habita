"""
Invitaciones de residentes (Habita)

  POST /api/invitaciones/enviar   (lo usa el administrador desde Residentes)
      Manda por mail el codigo de invitacion.

Ademas expone dos funciones que usa el registro (main.py):
  validar_codigo(codigo, email)   -> None si sirve, o lanza HTTPException
  canjear_codigo(codigo, user_id) -> deja la invitacion USADA y vincula la unidad

El mail sale por SMTP. Variables de entorno (en backend/.env):
  SMTP_HOST, SMTP_PORT (587 por defecto), SMTP_USER, SMTP_PASSWORD,
  SMTP_FROM (opcional, por defecto SMTP_USER), APP_URL (por defecto http://localhost:5173)
Si no estan configuradas, el endpoint NO falla: responde {"enviado": false, "motivo": ...}
y la pantalla le muestra el codigo al administrador para que lo pase a mano.
"""
from __future__ import annotations

import os
import smtplib
import ssl
from email.message import EmailMessage
from html import escape

import requests
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/invitaciones", tags=["invitaciones"])

MOTIVOS = {
    "no_existe": "El código de invitación no existe. Revisá que esté bien escrito.",
    "usada": "Ese código ya fue utilizado.",
    "cancelada": "Esa invitación fue cancelada por la administración.",
    "vencida": "El código venció. Pedile a la administración que te reenvíe uno nuevo.",
    "email_distinto": "Ese código fue emitido para otro email. Registrate con el email que recibió la invitación.",
}


def _supabase() -> tuple[str, str, str]:
    url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    anon = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY") or ""
    service = os.getenv("SUPABASE_SERVICE_ROLE") or ""
    if not url:
        raise HTTPException(status_code=500, detail="SUPABASE_URL no está configurado")
    return url, anon, service


def _rpc(nombre: str, cuerpo: dict, *, token_usuario: str | None = None):
    """Llama a una funcion de la base. Con token_usuario actua como ese usuario; sin el, como service role."""
    url, anon, service = _supabase()
    if token_usuario:
        clave, auth = anon, token_usuario
    else:
        clave, auth = service, service
    return requests.post(
        f"{url}/rest/v1/rpc/{nombre}",
        json=cuerpo,
        headers={"apikey": clave, "Authorization": f"Bearer {auth}", "Content-Type": "application/json"},
        timeout=15,
    )


def _detalle(resp: requests.Response, defecto: str) -> str:
    try:
        return resp.json().get("message") or defecto
    except Exception:
        return defecto


# ---------------------------------------------------------------- registro

def validar_codigo(codigo: str, email: str) -> None:
    resp = _rpc("validar_invitacion", {"p_codigo": codigo, "p_email": email})
    if resp.status_code >= 400:
        raise HTTPException(status_code=500, detail="No pudimos validar el código de invitación.")
    datos = resp.json()
    if not datos.get("valido"):
        raise HTTPException(status_code=400, detail=MOTIVOS.get(datos.get("motivo"), "El código de invitación no es válido."))


def canjear_codigo(codigo: str, user_id: str) -> None:
    resp = _rpc("canjear_invitacion", {"p_codigo": codigo, "p_usuario": user_id})
    if resp.status_code >= 400:
        raise HTTPException(status_code=400, detail=_detalle(resp, "No pudimos usar el código de invitación."))


# ---------------------------------------------------------------- mail

def _smtp_configurado() -> bool:
    return bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))


def _armar_mail(datos: dict) -> EmailMessage:
    app_url = (os.getenv("APP_URL") or "http://localhost:5173").rstrip("/")
    registro = f"{app_url}/register"
    codigo = datos["codigo"]
    edificio = datos.get("edificio") or "tu edificio"
    unidad = datos.get("unidad") or ""
    vence = str(datos.get("vence_en") or "")[:10]
    vence_txt = "/".join(reversed(vence.split("-"))) if vence else ""

    msg = EmailMessage()
    msg["Subject"] = f"Tu código de invitación a Habita – {edificio}"
    msg["From"] = os.getenv("SMTP_FROM") or os.getenv("SMTP_USER")
    msg["To"] = datos["email"]

    msg.set_content(
        f"Hola,\n\nLa administración de {edificio} te invitó a Habita (unidad {unidad}).\n\n"
        f"Tu código de invitación es: {codigo}\n"
        f"Es de un solo uso{f' y vence el {vence_txt}' if vence_txt else ''}.\n\n"
        f"Creá tu cuenta acá: {registro}\n"
        f"Importante: registrate con este mismo email ({datos['email']}).\n\n"
        "Si no esperabas este mensaje, podés ignorarlo."
    )
    msg.add_alternative(
        f"""<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#08363C">
<h2 style="color:#0D5F59">Te invitaron a Habita</h2>
<p>La administración de <strong>{escape(edificio)}</strong> te invitó a sumarte (unidad <strong>{escape(str(unidad))}</strong>).</p>
<p style="margin:24px 0;padding:16px;text-align:center;background:#eaf5f4;border:1px dashed #279B97;border-radius:10px">
<span style="font-size:12px;color:#4d545f">TU CÓDIGO DE INVITACIÓN</span><br>
<strong style="font-family:Consolas,monospace;font-size:28px;letter-spacing:4px">{escape(codigo)}</strong></p>
<p style="font-size:13px">Es de un solo uso{f' y vence el {escape(vence_txt)}' if vence_txt else ''}. Registrate con este mismo email (<strong>{escape(datos['email'])}</strong>).</p>
<p><a href="{escape(registro)}" style="display:inline-block;padding:10px 18px;background:#279B97;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">Crear mi cuenta</a></p>
<p style="font-size:12px;color:#4d545f">Si no esperabas este mensaje, podés ignorarlo.</p></div>""",
        subtype="html",
    )
    return msg


def _enviar_smtp(msg: EmailMessage) -> None:
    host = os.environ["SMTP_HOST"]
    puerto = int(os.getenv("SMTP_PORT") or 587)
    usuario, clave = os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"]
    contexto = ssl.create_default_context()
    if puerto == 465:
        with smtplib.SMTP_SSL(host, puerto, context=contexto, timeout=20) as s:
            s.login(usuario, clave)
            s.send_message(msg)
    else:
        with smtplib.SMTP(host, puerto, timeout=20) as s:
            if os.getenv("SMTP_STARTTLS", "1") != "0":
                s.starttls(context=contexto)
            s.login(usuario, clave)
            s.send_message(msg)


class EnviarIn(BaseModel):
    invitacion_id: int


@router.post("/enviar")
def enviar(payload: EnviarIn, authorization: str | None = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Falta iniciar sesión.")
    token = authorization.split(" ", 1)[1].strip()

    # La base comprueba que quien llama administre ese edificio
    resp = _rpc("admin_datos_envio_invitacion", {"p_id": payload.invitacion_id}, token_usuario=token)
    if resp.status_code in (401, 403):
        raise HTTPException(status_code=403, detail="No tenés permiso para esta invitación.")
    if resp.status_code >= 400:
        raise HTTPException(status_code=404, detail=_detalle(resp, "No encontramos esa invitación."))
    datos = resp.json()

    if not _smtp_configurado():
        return {"enviado": False, "motivo": "el servidor de correo todavía no está configurado"}

    try:
        _enviar_smtp(_armar_mail(datos))
    except Exception as e:  # noqa: BLE001  (cualquier falla de red/credenciales)
        print(f"[invitaciones] no se pudo enviar el mail: {e!r}")
        return {"enviado": False, "motivo": "el servidor de correo rechazó el envío"}

    _rpc("admin_marcar_invitacion_enviada", {"p_id": payload.invitacion_id}, token_usuario=token)
    return {"enviado": True, "motivo": ""}
