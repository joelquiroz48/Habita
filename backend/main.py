from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
import requests

from invitaciones import router as invitaciones_router, validar_codigo, canjear_codigo
from pagos import router as pagos_router

load_dotenv('.env')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL:
    # Allow import/time of dev, but endpoints will raise if unset
    pass

app = FastAPI(title="Habita Auth Proxy")

app.include_router(invitaciones_router)
app.include_router(pagos_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
    + ([os.getenv("FRONTEND_URL").rstrip("/")] if os.getenv("FRONTEND_URL") else []),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    user_metadata: dict | None = None
    codigo_invitacion: str | None = None


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

    codigo = (payload.codigo_invitacion or "").strip()
    if codigo:
        # El codigo tiene que existir, estar vigente y ser para este email
        validar_codigo(codigo, payload.email)
    elif os.getenv("REGISTRO_REQUIERE_CODIGO", "").lower() in ("1", "true", "si"):
        raise HTTPException(status_code=400, detail="Necesitás un código de invitación para registrarte.")

    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/admin/users"
    # Mark email as confirmed to allow immediate login when creating via service role
    body = {"email": payload.email, "password": payload.password, "email_confirm": True}
    if payload.user_metadata:
        body["user_metadata"] = payload.user_metadata

    headers = _supabase_headers(use_service_role=True, content_type="application/json")
    resp = requests.post(url, json=body, headers=headers)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.json())

    usuario = resp.json()

    if codigo:
        try:
            canjear_codigo(codigo, usuario["id"])
        except HTTPException:
            # Si no se pudo vincular la unidad, no dejamos una cuenta a medias
            requests.delete(f"{url}/{usuario['id']}", headers=headers)
            raise

    return {"user": usuario}


@app.post("/api/auth/login")
def login(payload: LoginIn):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_URL or SUPABASE_ANON_KEY not set"
        )

    # 1. Autenticar usuario en Supabase Auth
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password"

    json_body = {
        "email": payload.email,
        "password": payload.password
    }

    headers = _supabase_headers(
        use_service_role=False,
        content_type="application/json"
    )

    resp = requests.post(
        url,
        json=json_body,
        headers=headers
    )

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=resp.json()
        )

    auth_data = resp.json()

    # 2. Obtener ID del usuario autenticado
    user_id = auth_data["user"]["id"]

    # 3. Buscar el usuario en la tabla "usuario"
    usuario_url = (
        f"{SUPABASE_URL.rstrip('/')}"
        f"/rest/v1/usuario?id=eq.{user_id}&select=tipo"
    )

    usuario_resp = requests.get(
        usuario_url,
        headers=_supabase_headers(use_service_role=True)
    )

    if usuario_resp.status_code >= 400:
        raise HTTPException(
            status_code=usuario_resp.status_code,
            detail=usuario_resp.json()
        )

    usuarios = usuario_resp.json()

    if not usuarios:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado en la tabla usuario"
        )

    # 4. Obtener rol
    tipo = usuarios[0]["tipo"]

    # 5. Agregar el rol a la respuesta del login
    auth_data["tipo"] = tipo

    return auth_data


@app.get("/api/health")
def health():
    return {"status": "ok"}
