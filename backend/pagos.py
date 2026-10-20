"""
Pagos con Mercado Pago (Checkout Pro).

Flujo:
  1. El residente toca "Pagar ahora"  ->  POST /api/pagos/crear-preferencia
     (el backend crea la preferencia en Mercado Pago y devuelve la URL de pago).
  2. El residente paga en Mercado Pago y vuelve a /expensas?pago=exito&payment_id=...
     El frontend llama a POST /api/pagos/confirmar, que le PREGUNTA a Mercado Pago
     si ese pago existe y esta aprobado (nunca confiamos en lo que manda el navegador).
  3. Ademas Mercado Pago avisa por su cuenta a POST /api/pagos/webhook. Es el camino
     confiable (funciona aunque el residente cierre la pestana) pero necesita una URL
     publica https. En desarrollo local alcanza con el paso 2.
Los dos caminos terminan en la misma funcion SQL (registrar_pago_mp), que es idempotente:
si el aviso llega dos veces, el pago se registra una sola vez.

Variables de backend/.env:
  MP_ACCESS_TOKEN      (obligatoria)  Access Token de Mercado Pago
  FRONTEND_URL         a donde vuelve el residente        (por defecto http://localhost:5173)
  PUBLIC_BASE_URL      URL publica https de ESTE backend, para el webhook (opcional en local)
  MP_WEBHOOK_SECRET    clave secreta del webhook (opcional pero recomendada)
  MP_SANDBOX           "true" para usar el link de pruebas (por defecto: true si el token empieza con TEST-)
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import os
import re

import requests
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel

log = logging.getLogger("habita.pagos")
router = APIRouter(prefix="/api/pagos", tags=["pagos"])

TIMEOUT = 15


# ---------------------------------------------------------------------
# Configuracion (se lee en cada uso, asi no depende del orden en que se carga el .env)
# ---------------------------------------------------------------------
def _env(nombre: str, defecto: str = "") -> str:
    return (os.getenv(nombre) or defecto).strip()


def _mp_token() -> str:
    token = _env("MP_ACCESS_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Falta MP_ACCESS_TOKEN en backend/.env")
    return token


def _mp_base() -> str:
    return _env("MP_API_BASE", "https://api.mercadopago.com").rstrip("/")


def _frontend_url() -> str:
    return _env("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def _es_https(url: str) -> bool:
    return url.lower().startswith("https://")


def _usar_sandbox() -> bool:
    valor = _env("MP_SANDBOX").lower()
    if valor:
        return valor in ("1", "true", "si", "yes")
    return _mp_token().startswith("TEST-")


# ---------------------------------------------------------------------
# Supabase (service role) y Mercado Pago
# ---------------------------------------------------------------------
def _sb_url(ruta: str) -> str:
    base = _env("SUPABASE_URL")
    if not base:
        raise HTTPException(status_code=500, detail="Falta SUPABASE_URL en backend/.env")
    return f"{base.rstrip('/')}{ruta}"


def _sb_headers(clave_env: str = "SUPABASE_SERVICE_ROLE") -> dict:
    clave = _env(clave_env) or (_env("VITE_SUPABASE_PUBLISHABLE_KEY") if clave_env == "SUPABASE_ANON_KEY" else "")
    if not clave:
        raise HTTPException(status_code=500, detail=f"Falta {clave_env} en backend/.env")
    return {"apikey": clave, "Authorization": f"Bearer {clave}", "Content-Type": "application/json"}


def _sb_rpc(nombre: str, args: dict) -> dict | None:
    try:
        r = requests.post(_sb_url(f"/rest/v1/rpc/{nombre}"), json=args, headers=_sb_headers(), timeout=TIMEOUT)
    except requests.RequestException as e:
        log.error("Supabase no responde: %s", e)
        raise HTTPException(status_code=502, detail="No pudimos conectar con la base de datos.")
    if r.status_code >= 400:
        log.error("Supabase rpc %s -> %s %s", nombre, r.status_code, r.text[:500])
        try:
            error = r.json()
        except ValueError:
            error = {}
        codigo, mensaje = str(error.get("code") or ""), str(error.get("message") or "")
        # Errores "esperables" que la funcion SQL levanta a proposito
        if codigo == "P0002":
            raise HTTPException(status_code=404, detail=mensaje)
        if codigo == "42501":
            raise HTTPException(status_code=403, detail=mensaje)
        if codigo == "22023":
            raise HTTPException(status_code=409, detail=mensaje)
        if codigo == "PGRST202" or "Could not find the function" in mensaje:
            raise HTTPException(status_code=500, detail="Falta correr sql/22_pagos_mercadopago.sql en Supabase.")
        if r.status_code in (401, 403) or "permission denied" in mensaje.lower():
            raise HTTPException(status_code=500, detail="Supabase rechazó la clave del backend (revisá SUPABASE_SERVICE_ROLE en backend/.env).")
        raise HTTPException(status_code=500, detail=f"Error de la base de datos ({codigo or r.status_code}): {mensaje[:160]}")
    return r.json() if r.content else None


def _mp(metodo: str, ruta: str, **kw) -> requests.Response:
    headers = {"Authorization": f"Bearer {_mp_token()}", "Content-Type": "application/json"}
    try:
        return requests.request(metodo, f"{_mp_base()}{ruta}", headers=headers, timeout=TIMEOUT, **kw)
    except requests.RequestException as e:
        log.error("Mercado Pago no responde: %s", e)
        raise HTTPException(status_code=502, detail="No pudimos conectar con Mercado Pago. Probá de nuevo.")


def _mensaje_mp(resp: requests.Response) -> str:
    try:
        datos = resp.json()
    except ValueError:
        return resp.text[:200]
    causas = "; ".join(str(c.get("description") or c.get("code")) for c in (datos.get("cause") or []) if isinstance(c, dict))
    return " - ".join(x for x in [str(datos.get("message") or datos.get("error") or ""), causas] if x) or resp.text[:200]


# ---------------------------------------------------------------------
# Usuario logueado y expensa
# ---------------------------------------------------------------------
def _usuario_actual(authorization: str | None) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Iniciá sesión para pagar.")
    token = authorization.split(" ", 1)[1].strip()
    try:
        r = requests.get(
            _sb_url("/auth/v1/user"),
            headers={"apikey": _sb_headers("SUPABASE_ANON_KEY")["apikey"], "Authorization": f"Bearer {token}"},
            timeout=TIMEOUT,
        )
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="No pudimos verificar tu sesión.")
    if r.status_code != 200 or not r.json().get("id"):
        raise HTTPException(status_code=401, detail="Tu sesión venció. Volvé a iniciar sesión.")
    return r.json()


# ---------------------------------------------------------------------
# 1) Crear la preferencia
# ---------------------------------------------------------------------
class CrearPreferenciaIn(BaseModel):
    expensa_id: int


@router.post("/crear-preferencia")
def crear_preferencia(payload: CrearPreferenciaIn, authorization: str | None = Header(default=None)):
    usuario = _usuario_actual(authorization)
    # Una sola consulta a la base: verifica que la expensa sea de su unidad y calcula el saldo
    datos_exp = _sb_rpc("preparar_pago_mp", {"p_usuario": usuario["id"], "p_expensa": payload.expensa_id})
    saldo = float(datos_exp["saldo"])
    detalle_unidad = f" - Unidad {datos_exp['unidad_numero']}" if datos_exp.get("unidad_numero") else ""
    expensa = {"id": datos_exp["expensa_id"], "periodo": datos_exp["periodo"]}

    front = _frontend_url()
    preferencia = {
        "items": [{
            "id": str(expensa["id"]),
            "title": f"Expensa {expensa['periodo']}{detalle_unidad}",
            "quantity": 1,
            "unit_price": saldo,
            "currency_id": "ARS",
        }],
        # Asi sabemos, cuando llega el aviso de pago, a que expensa corresponde
        "external_reference": str(expensa["id"]),
        "back_urls": {
            "success": f"{front}/expensas?pago=exito",
            "failure": f"{front}/expensas?pago=error",
            "pending": f"{front}/expensas?pago=pendiente",
        },
        "statement_descriptor": "HABITA",
        "metadata": {"expensa_id": expensa["id"], "usuario_id": usuario["id"]},
    }
    # auto_return = Mercado Pago devuelve solo al residente a Habita apenas se aprueba el pago.
    # Con direcciones locales (http://localhost) a veces lo rechaza: en ese caso se reintenta sin
    # el y el residente vuelve con el boton "Volver al sitio" de Mercado Pago.
    if _env("MP_AUTO_RETURN", "true").lower() not in ("0", "false", "no"):
        preferencia["auto_return"] = "approved"
    # notification_url tiene que ser una URL publica https; si no, Mercado Pago rechaza TODA la preferencia
    publica = _env("PUBLIC_BASE_URL").rstrip("/")
    if publica and _es_https(publica):
        preferencia["notification_url"] = f"{publica}/api/pagos/webhook"
    elif publica:
        log.warning("PUBLIC_BASE_URL (%s) no es https: no se envia notification_url (el webhook no va a funcionar).", publica)

    resp = _mp("POST", "/checkout/preferences", json=preferencia)
    if resp.status_code == 400 and "auto_return" in preferencia and "auto_return" in resp.text.lower():
        log.warning("Mercado Pago no acepto auto_return con %s; se reintenta sin el.", front)
        preferencia.pop("auto_return")
        resp = _mp("POST", "/checkout/preferences", json=preferencia)
    if resp.status_code not in (200, 201):
        log.error("Mercado Pago rechazo la preferencia: %s %s", resp.status_code, resp.text[:500])
        if resp.status_code in (401, 403):
            raise HTTPException(status_code=502, detail="Mercado Pago rechazó las credenciales (MP_ACCESS_TOKEN inválido o vencido).")
        raise HTTPException(status_code=502, detail=f"Mercado Pago no aceptó el pago: {_mensaje_mp(resp)}")

    datos = resp.json()
    sandbox = _usar_sandbox()
    url = datos.get("sandbox_init_point") if sandbox else datos.get("init_point")
    url = url or datos.get("init_point") or datos.get("sandbox_init_point")
    if not url:
        raise HTTPException(status_code=502, detail="Mercado Pago no devolvió el link de pago.")
    return {
        "preference_id": datos.get("id"),
        "url": url,
        "init_point": datos.get("init_point"),
        "sandbox_init_point": datos.get("sandbox_init_point"),
        "sandbox": sandbox,
        "importe": saldo,
    }


# ---------------------------------------------------------------------
# Registrar un pago (lo usan el webhook y la confirmacion)
# ---------------------------------------------------------------------
def _consultar_pago(payment_id: str) -> dict | None:
    """Le pregunta a Mercado Pago por el pago. None si no existe."""
    if not re.fullmatch(r"\d{1,20}", str(payment_id)):
        return None
    resp = _mp("GET", f"/v1/payments/{payment_id}")
    if resp.status_code == 404:
        return None
    if resp.status_code != 200:
        log.error("Mercado Pago GET payment %s -> %s %s", payment_id, resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="No pudimos consultar el pago en Mercado Pago.")
    return resp.json()


def _expensa_de_pago(pago: dict) -> int | None:
    ref = str(pago.get("external_reference") or "").strip()
    return int(ref) if ref.isdigit() else None


def _registrar(pago: dict) -> dict:
    expensa_id = _expensa_de_pago(pago)
    if expensa_id is None:
        return {"resultado": "ignorado", "motivo": "El pago no tiene external_reference de una expensa."}
    if pago.get("currency_id") not in (None, "ARS"):
        return {"resultado": "ignorado", "motivo": "Moneda distinta de ARS."}
    return _sb_rpc("registrar_pago_mp", {
        "p_expensa": expensa_id,
        "p_payment_id": str(pago["id"]),
        "p_estado_mp": pago.get("status") or "",
        "p_monto": float(pago.get("transaction_amount") or 0),
        "p_metodo": _metodo_legible(pago),
        "p_fecha": pago.get("date_approved") or pago.get("date_created"),
    })


def _metodo_legible(pago: dict) -> str:
    tipo = str(pago.get("payment_type_id") or "")
    nombres = {"credit_card": "Tarjeta de crédito", "debit_card": "Tarjeta de débito", "account_money": "Dinero en cuenta",
               "ticket": "Efectivo", "bank_transfer": "Transferencia", "atm": "Cajero"}
    return f"Mercado Pago - {nombres.get(tipo, 'Mercado Pago')}" if tipo else "Mercado Pago"


def _anotar_evento(tipo: str, data_id: str | None, expensa_id: int | None, resultado: str, detalle: dict | None = None) -> None:
    """Deja constancia en la tabla mp_evento. Si falla, no rompe el pago."""
    try:
        _sb_rpc("registrar_mp_evento", {"p_tipo": tipo, "p_data_id": data_id, "p_expensa": expensa_id,
                                        "p_resultado": resultado, "p_detalle": detalle})
    except HTTPException:
        pass


# ---------------------------------------------------------------------
# 2) Confirmacion al volver de Mercado Pago
# ---------------------------------------------------------------------
class ConfirmarIn(BaseModel):
    payment_id: str


@router.post("/confirmar")
def confirmar(payload: ConfirmarIn, authorization: str | None = Header(default=None)):
    usuario = _usuario_actual(authorization)
    pago = _consultar_pago(payload.payment_id)
    if pago is None:
        raise HTTPException(status_code=404, detail="Mercado Pago no encontró ese pago.")

    expensa_id = _expensa_de_pago(pago)
    if expensa_id is None:
        raise HTTPException(status_code=400, detail="Ese pago no corresponde a una expensa de Habita.")
    _sb_rpc("expensa_es_de_usuario", {"p_usuario": usuario["id"], "p_expensa": expensa_id})  # tiene que ser de SU unidad

    resultado = _registrar(pago) or {}
    _anotar_evento("confirmar", str(pago["id"]), expensa_id, str(resultado.get("resultado")), {"status": pago.get("status")})
    return {"estado_mp": pago.get("status"), "expensa_id": expensa_id, **resultado}


# ---------------------------------------------------------------------
# 2b) Sincronizar: "buscame en Mercado Pago si esta expensa ya se pago"
#     Sirve cuando el residente no volvio por el boton de Mercado Pago y no hay webhook
#     (por ejemplo en desarrollo local). El frontend lo llama al abrir Expensas.
# ---------------------------------------------------------------------
class SincronizarIn(BaseModel):
    expensa_id: int


@router.post("/sincronizar")
def sincronizar(payload: SincronizarIn, authorization: str | None = Header(default=None)):
    usuario = _usuario_actual(authorization)
    _sb_rpc("expensa_es_de_usuario", {"p_usuario": usuario["id"], "p_expensa": payload.expensa_id})

    resp = _mp("GET", "/v1/payments/search", params={
        "external_reference": str(payload.expensa_id), "sort": "date_created", "criteria": "desc", "limit": 10})
    if resp.status_code != 200:
        log.error("Mercado Pago search -> %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="No pudimos consultar tus pagos en Mercado Pago.")
    pagos = [p for p in (resp.json().get("results") or []) if _expensa_de_pago(p) == payload.expensa_id]

    estados = set()
    resultado: dict = {}
    for pago in reversed(pagos):  # del mas viejo al mas nuevo
        estados.add(str(pago.get("status")))
        resultado = _registrar(pago) or resultado
    _anotar_evento("sincronizar", str(payload.expensa_id), payload.expensa_id, f"{len(pagos)} pagos", {"estados": sorted(estados)})

    if "approved" in estados:
        estado = "approved"
    elif estados & {"pending", "in_process", "authorized", "in_mediation"}:
        estado = "pending"
    elif estados:
        estado = "rejected"
    else:
        estado = "sin_pagos"
    return {"estado_mp": estado, "cantidad": len(pagos), "expensa_estado": resultado.get("expensa_estado")}


# ---------------------------------------------------------------------
# 3) Webhook (aviso automatico de Mercado Pago)
# ---------------------------------------------------------------------
def _firma_valida(request: Request, data_id: str | None) -> bool:
    secreto = _env("MP_WEBHOOK_SECRET")
    if not secreto:
        log.warning("MP_WEBHOOK_SECRET no configurada: no se valida la firma del webhook.")
        return True
    firma = request.headers.get("x-signature", "")
    partes = dict(p.strip().split("=", 1) for p in firma.split(",") if "=" in p)
    ts, v1 = partes.get("ts"), partes.get("v1")
    if not ts or not v1:
        return False
    manifiesto = ""
    if data_id:
        manifiesto += f"id:{data_id.lower() if data_id.isalnum() else data_id};"
    request_id = request.headers.get("x-request-id")
    if request_id:
        manifiesto += f"request-id:{request_id};"
    manifiesto += f"ts:{ts};"
    esperado = hmac.new(secreto.encode(), manifiesto.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(esperado, v1)


@router.post("/webhook")
async def webhook(request: Request):
    consulta = request.query_params
    try:
        cuerpo = await request.json()
        if not isinstance(cuerpo, dict):
            cuerpo = {}
    except ValueError:
        cuerpo = {}

    tipo = consulta.get("type") or consulta.get("topic") or cuerpo.get("type") or cuerpo.get("topic")
    data_id = consulta.get("data.id") or consulta.get("id") or (cuerpo.get("data") or {}).get("id")
    data_id = str(data_id) if data_id is not None else None

    if not _firma_valida(request, consulta.get("data.id") or data_id):
        log.warning("Webhook con firma invalida (data.id=%s)", data_id)
        raise HTTPException(status_code=401, detail="Firma inválida.")

    if tipo != "payment" or not data_id:
        return {"ok": True, "ignorado": tipo}

    pago = _consultar_pago(data_id)
    if pago is None:
        # Por ejemplo la notificacion de prueba del panel de Mercado Pago (id 123456)
        _anotar_evento("payment", data_id, None, "no_encontrado")
        return {"ok": True, "ignorado": "pago inexistente"}

    resultado = _registrar(pago) or {}
    _anotar_evento("payment", data_id, _expensa_de_pago(pago), str(resultado.get("resultado")), {"status": pago.get("status")})
    return {"ok": True, **resultado}


# ---------------------------------------------------------------------
# Diagnostico: abrilo en el navegador -> http://localhost:8000/api/pagos/diagnostico
# Muestra que falta configurar (nunca muestra las claves).
# ---------------------------------------------------------------------
@router.get("/diagnostico")
def diagnostico():
    res: dict = {
        "SUPABASE_URL": bool(_env("SUPABASE_URL")),
        "SUPABASE_SERVICE_ROLE": bool(_env("SUPABASE_SERVICE_ROLE")),
        "SUPABASE_ANON_KEY": bool(_env("SUPABASE_ANON_KEY") or _env("VITE_SUPABASE_PUBLISHABLE_KEY")),
        "MP_ACCESS_TOKEN": bool(_env("MP_ACCESS_TOKEN")),
        "FRONTEND_URL": _frontend_url(),
        "PUBLIC_BASE_URL": _env("PUBLIC_BASE_URL") or "(vacía: el webhook no va a recibir avisos, pero el pago funciona igual)",
        "MP_WEBHOOK_SECRET": bool(_env("MP_WEBHOOK_SECRET")),
    }
    if res["MP_ACCESS_TOKEN"]:
        res["modo_sandbox"] = _usar_sandbox()
        try:
            r = _mp("GET", "/users/me")
            res["MP_token_valido"] = r.status_code == 200
            if r.status_code != 200:
                res["MP_detalle"] = _mensaje_mp(r)
        except HTTPException as e:
            res["MP_token_valido"] = False
            res["MP_detalle"] = e.detail
    if res["SUPABASE_URL"] and res["SUPABASE_SERVICE_ROLE"]:
        try:
            _sb_rpc("expensa_es_de_usuario", {"p_usuario": "00000000-0000-0000-0000-000000000000", "p_expensa": 0})
            res["sql_22_instalado"] = True
        except HTTPException as e:
            # 403 = la funcion existe y respondio "no es de tu unidad": todo bien
            res["sql_22_instalado"] = e.status_code == 403
            if e.status_code != 403:
                res["supabase_detalle"] = e.detail
    return res
