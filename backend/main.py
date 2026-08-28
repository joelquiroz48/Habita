from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
import requests

load_dotenv('.env')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL:
    # Allow import/time of dev, but endpoints will raise if unset
    pass

app = FastAPI(title="Habita Auth Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    user_metadata: dict | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


def _supabase_headers(use_service_role: bool = True, content_type: str = "application/json") -> dict:
    if use_service_role:
        key = SUPABASE_SERVICE_ROLE
    else:
        key = SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": content_type,
    }


@app.post("/api/auth/register")
def register(payload: RegisterIn):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
        raise HTTPException(status_code=500, detail="SUPABASE_URL or SUPABASE_SERVICE_ROLE not set")

    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/admin/users"
    # Mark email as confirmed to allow immediate login when creating via service role
    body = {"email": payload.email, "password": payload.password, "email_confirm": True}
    if payload.user_metadata:
        body["user_metadata"] = payload.user_metadata

    headers = _supabase_headers(use_service_role=True, content_type="application/json")
    resp = requests.post(url, json=body, headers=headers)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.json())

    return {"user": resp.json()}


@app.post("/api/auth/login")
def login(payload: LoginIn):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="SUPABASE_URL or SUPABASE_ANON_KEY not set")

    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password"
    # Some Supabase deployments accept JSON for the token endpoint — send JSON.
    json_body = {"email": payload.email, "password": payload.password}
    headers = _supabase_headers(use_service_role=False, content_type="application/json")
    resp = requests.post(url, json=json_body, headers=headers)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.json())

    return resp.json()


@app.get("/api/health")
def health():
    return {"status": "ok"}

import mercadopago

MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
MP_WEBHOOK_SECRET = os.getenv("MP_WEBHOOK_SECRET")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL")


def _supabase_url(path: str) -> str:
    return f"{SUPABASE_URL.rstrip('/')}/rest/v1/{path}"


def obtener_expensa(expensa_id: str) -> dict:
    resp = requests.get(
        _supabase_url(f"expensa?id=eq.{expensa_id}"),
        headers=_supabase_headers(use_service_role=True),
    )
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.json())
    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="Expensa no encontrada")
    return data[0]


class CrearPreferenciaIn(BaseModel):
    expensa_id: str


@app.post("/api/pagos/crear-preferencia")
def crear_preferencia(payload: CrearPreferenciaIn):
    expensa = obtener_expensa(payload.expensa_id)

    sdk = mercadopago.SDK(MP_ACCESS_TOKEN)
    preference_data = {
        "items": [
            {
                "title": f"Expensa {expensa['periodo']} - Unidad {expensa['unidad_id']}",
                "quantity": 1,
                "unit_price": float(expensa["importe_total"]),
                "currency_id": "ARS",
            }
        ],
        # Con esto identificamos, cuando llegue la notificacion, a que Expensa corresponde
        "external_reference": str(expensa["id"]),
        "back_urls": {
            "success": "http://localhost:5173/pagos/exito",
            "failure": "http://localhost:5173/pagos/error",
            "pending": "http://localhost:5173/pagos/pendiente",
        },
        "auto_return": "approved",
        "notification_url": f"{PUBLIC_BASE_URL}/api/pagos/webhook",
    }

    resultado = sdk.preference().create(preference_data)
    preferencia = resultado["response"]

    return {
        "init_point": preferencia["init_point"],
        "sandbox_init_point": preferencia["sandbox_init_point"],
    }