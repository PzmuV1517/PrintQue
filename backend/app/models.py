from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class PrintJobCreate(BaseModel):
    team: str = Field(..., min_length=1, max_length=100)
    contact: str = Field(..., min_length=3, max_length=100)
    comments: Optional[str] = Field(None, max_length=1000)
    specs: Optional[str] = Field(None, max_length=1000)

class PrintJob(PrintJobCreate):
    id: str
    filename: str
    created_at: datetime

    class Config:
        from_attributes = True

def new_print_job(data: PrintJobCreate, filename: str) -> PrintJob:
    return PrintJob(
        id=str(uuid.uuid4()),
        filename=filename,
        created_at=datetime.utcnow(),
        **data.model_dump(),
    )
