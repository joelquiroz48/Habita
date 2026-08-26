# Backend auth proxy

This minimal backend proxies registration and login requests to Supabase Auth using the `SERVICE_ROLE` key.

Setup

1. Create a virtualenv and install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Set env vars (see `.env.example`) and run the server:

```powershell
#$env:SUPABASE_URL='https://your-project.supabase.co'
#$env:SUPABASE_SERVICE_ROLE='service-role-xxx'
uvicorn main:app --reload --port 8000
```

Endpoints

- `POST /api/auth/register` JSON `{ "email": "...", "password": "..." }`
- `POST /api/auth/login` JSON `{ "email": "...", "password": "..." }`