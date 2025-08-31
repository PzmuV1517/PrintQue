from typing import Dict, List
from .models import PrintJob, PrintJobCreate, new_print_job
from pathlib import Path
import shutil

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

_jobs: Dict[str, PrintJob] = {}


def list_jobs() -> List[PrintJob]:
    return sorted(_jobs.values(), key=lambda j: j.created_at)


def add_job(data: PrintJobCreate, filename: str, file_content) -> PrintJob:
    job = new_print_job(data, filename)
    dest = UPLOAD_DIR / job.id
    dest.mkdir(parents=True, exist_ok=True)
    with open(dest / filename, "wb") as f:
        shutil.copyfileobj(file_content, f)
    _jobs[job.id] = job
    return job


def get_file_path(job_id: str) -> Path:
    job = _jobs.get(job_id)
    if not job:
        raise KeyError("Job not found")
    dest = UPLOAD_DIR / job.id / job.filename
    return dest


def delete_job(job_id: str) -> bool:
    job = _jobs.pop(job_id, None)
    if not job:
        return False
    folder = UPLOAD_DIR / job.id
    if folder.exists():
        shutil.rmtree(folder)
    return True
