 🚀 Cómo levantar Habita desde cero

Guía paso a paso para dejar el proyecto funcionando en tu computadora (Windows + PowerShell + VS Code).
Si algo falla, mirá la sección [Problemas comunes](#-problemas-comunes) al final.

---

## 🧩 Cómo está armado el proyecto

Habita tiene **tres piezas** que corren al mismo tiempo, cada una en su propia terminal:

| Pieza | Carpeta | Tecnología | Puerto | ¿Para qué sirve? |
|---|---|---|---|---|
| **Frontend** | `frontend/` | React + Vite | `5173` | Las pantallas de la página |
| **Backend de autenticación** | `backend/` | Python + FastAPI | `8000` | Registro, inicio de sesión y pagos |
| **Servidor del asistente** | raíz (`server.js`) | Node + Express | `3000` | El chat con el asistente de Habita (Gemini) |

La **base de datos** es Supabase (PostgreSQL en la nube). Es **una sola, compartida por todo el equipo**: no hay que instalar nada local.

> 💡 **No hace falta levantar todo siempre.** Para ver y desarrollar pantallas alcanza con el frontend.
> El backend es necesario para registrarse e iniciar sesión, y el servidor del asistente solo para el chat.

---

## ✅ Paso 0: Programas que tenés que instalar (una sola vez)

| Programa | Versión | Cómo comprobarlo | Descarga |
|---|---|---|---|
| **Git** | cualquiera reciente | `git --version` | https://git-scm.com |
| **Node.js** | **22 LTS** | `node -v` | https://nodejs.org |
| **Python** | **3.10 a 3.12** (evitá 3.13 o superior) | `python --version` | https://www.python.org/downloads |
| **VS Code** | cualquiera | — | https://code.visualstudio.com |

⚠️ **Al instalar Python, marcá la casilla "Add python.exe to PATH"** (aparece en la primera pantalla del instalador). Sin eso, la terminal no encuentra `python`.

Después de instalar algo, **cerrá y volvé a abrir VS Code** para que la terminal lo reconozca.

---

## 📥 Paso 1: Clonar el repositorio

Elegí una carpeta donde guardar el proyecto, abrí una terminal en ella y ejecutá:

```powershell
git clone https://github.com/joelquiroz48/Habita.git
cd Habita
```

Después abrí la carpeta en VS Code (`File → Open Folder` y elegí `Habita`).

> Para abrir una terminal en VS Code: menú **Terminal → New Terminal**. El botón **`+`** del panel abre una terminal nueva.

---

## 🔑 Paso 2: Conseguir las claves (variables de entorno)

Las claves **no están en el repositorio** (por seguridad). Hay que crear unos archivos de configuración en tu computadora. Cada carpeta trae un archivo `.env.example` con el modelo de qué completar.

| Archivo que vas a crear | A partir de | Lo usa |
|---|---|---|
| `frontend/.env.local` | `frontend/.env.example` | Frontend |
| `backend/.env` | `backend/.env.example` | Backend (puerto 8000) |
| `.env` (en la raíz) | `.env.example` | Servidor del asistente (puerto 3000) |

Para crear cada uno, **copiá el `.env.example` y cambiale el nombre**. Por ejemplo, desde la raíz del proyecto:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
Copy-Item backend\.env.example backend\.env
Copy-Item .env.example .env
```

Después abrí cada archivo y reemplazá los valores de ejemplo por los reales.

### ¿De dónde sale cada valor?

**Supabase** (`Project URL` y claves): entrá al proyecto en [supabase.com](https://supabase.com) → **Project Settings** (el engranaje) → **API Keys / API**.

| Variable | Qué es | Dónde se usa |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) | `frontend/.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (`sb_publishable_...`) | `frontend/.env.local` |
| `SUPABASE_URL` | El mismo Project URL | `backend/.env` |
| `SUPABASE_ANON_KEY` | La misma clave pública | `backend/.env` |
| `SUPABASE_SERVICE_ROLE` | Clave **secreta** de administrador | `backend/.env` |
| `GEMINI_API_KEY` | Clave de la IA de Google | `.env` de la raíz |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `PUBLIC_BASE_URL` | Mercado Pago (solo para pagos) | `backend/.env` |

> 🔒 La clave **`SUPABASE_SERVICE_ROLE` es de administrador total** de la base de datos: nunca la pongas en el frontend, en capturas ni en el chat del grupo. Las claves secretas, **pedíselas al equipo por un canal privado**.
> Si no vas a trabajar con pagos o con el asistente, podés dejar esas variables sin completar.

### Reglas de oro de los archivos `.env`
- ❌ **Nunca** los subas a GitHub. Ya están en el `.gitignore`, pero fijate en `git status` antes de commitear.
- 🔄 **Si cambiás un `.env`, reiniciá** el programa correspondiente (frenalo con `Ctrl + C` y volvelo a levantar). Vite solo lee `frontend/.env.local` al arrancar.
- Sin espacios alrededor del `=` y sin comillas: `NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co`.

---

## ▶️ Paso 3: Levantar el frontend (puerto 5173)

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

- `npm.cmd install` descarga las librerías. **Solo hace falta la primera vez** (y cuando alguien agregue librerías nuevas).
- `npm.cmd run dev` levanta la página. Abrí **http://localhost:5173/**.

> Usamos `npm.cmd` en lugar de `npm` porque PowerShell a veces bloquea `npm` por una política de seguridad. Si a vos `npm` te funciona, podés usarlo igual.

Dejá esta terminal abierta mientras trabajás. Para frenar: `Ctrl + C`.

---

## ▶️ Paso 4: Levantar el backend de autenticación (puerto 8000)

Abrí una **segunda terminal** (botón `+`).

### La primera vez (preparación)

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

- `python -m venv venv` crea un "entorno virtual": una carpeta donde se instalan las librerías de Python solo para este proyecto. **No se sube a GitHub.**
- `Activate.ps1` activa ese entorno. Sabés que funcionó porque aparece **`(venv)`** al principio de la línea de la terminal.
- `pip install -r requirements.txt` instala las librerías de Python.

Si PowerShell dice que *"la ejecución de scripts está deshabilitada"*, ejecutá **una sola vez**:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
y repetí la activación.

### Las siguientes veces

```powershell
cd backend
venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

Cuando funciona se ve `Uvicorn running on http://127.0.0.1:8000`.

✔️ **Comprobación rápida:** abrí http://127.0.0.1:8000/api/health. Tiene que mostrar `{"status":"ok"}`.
📖 La documentación automática de la API está en http://127.0.0.1:8000/docs.

---

## ▶️ Paso 5: Levantar el servidor del asistente (puerto 3000)

Solo si vas a usar el chat del asistente. Abrí una **tercera terminal**, en la **raíz del proyecto** (la carpeta `Habita`, no `frontend`):

```powershell
npm.cmd install
npm.cmd run server
```

Necesita `GEMINI_API_KEY` en el archivo `.env` de la raíz (Paso 2).

> 💡 **Atajo:** desde la raíz, `npm.cmd run dev` levanta **el servidor del asistente y el frontend juntos** en una sola terminal. El backend de Python se sigue levantando aparte (Paso 4).

---

## 📋 Resumen: los comandos de todos los días

| Terminal | Carpeta | Comando |
|---|---|---|
| 1 · Frontend | `frontend` | `npm.cmd run dev` |
| 2 · Backend | `backend` | `venv\Scripts\Activate.ps1` y después `uvicorn main:app --reload --port 8000` |
| 3 · Asistente | raíz | `npm.cmd run server` |

Antes de empezar a trabajar cada día, traé lo nuevo del equipo:

```powershell
git pull origin main
```
Si `package.json` cambió, repetí `npm.cmd install`. Si `requirements.txt` cambió, repetí `pip install -r requirements.txt` con el `(venv)` activado.

---

## 🗄️ Base de datos (Supabase)

- Es una **base compartida en la nube**: lo que cambies ahí lo ven todos. **Avisale al grupo antes de modificar tablas.**
- Para ver los datos: entrá al proyecto en Supabase → **Table Editor**. Para ejecutar SQL: **SQL Editor**.
- Para ver qué usuarios existen: **Authentication → Users**.
- Los scripts SQL de cada módulo viven en la carpeta `supabase/` del repositorio, cuando el módulo los incluye (por ejemplo `supabase/reservas/`). Se ejecutan pegándolos en el **SQL Editor**, **en el orden numérico** de los archivos.
- Si una pantalla muestra *"Could not find the function..."*, ejecutá en el SQL Editor: `notify pgrst, 'reload schema';`

---

## 🧭 Cómo ver las pantallas

Con el frontend levantado entrás por URL. Algunas rutas:

| Rol | Rutas |
|---|---|
| Residente | `/inicio`, `/expensas`, `/reservas`, `/reclamos`, `/avisos`, `/documentos`, `/perfil` |
| Administrador | `/administrador/inicio`, `/administrador/residentes`, `/administrador/pagos`, `/administrador/reservas` |

> A la fecha de esta guía, el inicio de sesión todavía no protege el resto de la aplicación: se llega a las pantallas escribiendo la URL.

---

## 🛠️ Problemas comunes

| Lo que ves | Qué significa | Solución |
|---|---|---|
| `Uncaught Error: supabaseUrl is required` y la página en blanco | El frontend no encontró las claves de Supabase | Revisá que `frontend/.env.local` exista, que los **nombres de las variables sean exactamente los de la tabla del Paso 2** y que hayas **reiniciado** `npm.cmd run dev` |
| `python` / `uvicorn` "no se reconoce" o "no se encontró Python" | Python no está instalado o falta el PATH | Reinstalá Python marcando **Add python.exe to PATH**, reabrí VS Code y activá el `(venv)` |
| `Activate.ps1 cannot be loaded because running scripts is disabled` | PowerShell bloquea los scripts | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (una sola vez) |
| `npm.ps1 cannot be loaded` | Mismo bloqueo, para `npm` | Usá `npm.cmd` en lugar de `npm` |
| `ENOENT ... package.json` | Estás en la carpeta equivocada | `npm` del frontend se corre **dentro de `frontend`**; el del asistente, en la raíz |
| `Failed to resolve import ...` | Te falta código que subió otro compañero | `git pull origin main` y, si cambió `package.json`, `npm.cmd install` |
| `Error de red` al iniciar sesión o registrarse | El backend (puerto 8000) no está levantado | Levantalo (Paso 4) y revisá http://127.0.0.1:8000/api/health |
| `Address already in use` / el puerto está ocupado | Ya hay otra copia corriendo | Cerrá la terminal vieja (`Ctrl + C`) o reiniciá VS Code |
| El chat del asistente no responde | Falta el servidor del asistente o la `GEMINI_API_KEY` | Levantalo (Paso 5) y revisá el `.env` de la raíz |
| Cambié un `.env` y no pasa nada | Los programas leen el `.env` solo al arrancar | Frená con `Ctrl + C` y volvé a levantar |
| Error de CORS en la consola del navegador | La página no está en `localhost:5173` | Abrí la página exactamente en http://localhost:5173 |

---

## 🔐 Seguridad: recordatorio

- No subas `.env`, `.env.local` ni capturas con claves.
- Si una clave secreta se filtra (por ejemplo, se sube a GitHub), **hay que regenerarla** en Supabase / Google / Mercado Pago, porque borrarla del repositorio no alcanza: queda en el historial.
- Antes de cada `git commit`, mirá `git status`: nada de `.env`, `venv/` ni `node_modules/`.
