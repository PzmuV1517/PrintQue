from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List
from .models import PrintJob, PrintJobCreate
from pydantic import ValidationError
import re
from . import storage
from .auth import get_current_admin

app = FastAPI(title="Print Queue API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5420",
    "http://127.0.0.1:5420",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/admin/auth")
async def admin_auth(user=Depends(get_current_admin)):
    return {"status": "ok"}

@app.get("/queue", response_model=List[PrintJob])
async def get_queue():
    return storage.list_jobs()

@app.post("/queue", response_model=PrintJob, status_code=201)
async def create_job(
    team: str = Form(...),
    contact: str = Form(...),
    comments: str | None = Form(None),
    specs: str | None = Form(None),
    file: UploadFile = File(...),
):
    # Collapse internal whitespace and trim
    cleaned_team = re.sub(r"\s+", " ", team).strip()
    cleaned_contact = re.sub(r"\s+", " ", contact).strip()
    try:
        data = PrintJobCreate(team=cleaned_team, contact=cleaned_contact, comments=comments, specs=specs)
    except ValidationError as e:
        # Return a clean 400 with field errors
        raise HTTPException(status_code=400, detail=e.errors())
    job = storage.add_job(data, file.filename, file.file)
    return job

@app.get("/queue/{job_id}/download")
async def download_file(job_id: str, user=Depends(get_current_admin)):
    try:
        path = storage.get_file_path(job_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path, filename=path.name)

@app.delete("/queue/{job_id}", status_code=204)
async def remove_job(job_id: str, user=Depends(get_current_admin)):
    ok = storage.delete_job(job_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    return None
