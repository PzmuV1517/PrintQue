# Backend API

FastAPI service for the print queue.

## Run (dev)

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5420
```

PowerShell helper (from backend folder):
```powershell
./.venv/Scripts/Activate.ps1; uvicorn app.main:app --reload --port 5420
```

## Endpoints
- `GET /health` - service status
- `GET /queue` - list jobs (public)
- `POST /queue` - create job (multipart form: team, contact, comments?, specs?, file)
- `GET /queue/{id}/download` - admin basic-auth download
- `DELETE /queue/{id}` - admin basic-auth delete

Admin credentials (HTTP Basic):
- user: `qradmin`
- password: `kickathon`
