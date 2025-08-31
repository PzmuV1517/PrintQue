from fastapi import HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

security = HTTPBasic()

ADMIN_USER = "qradmin"
ADMIN_PASS = "kickathon"

def get_current_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_user = secrets.compare_digest(credentials.username, ADMIN_USER)
    correct_pass = secrets.compare_digest(credentials.password, ADMIN_PASS)
    if not (correct_user and correct_pass):
        raise HTTPException(status_code=401, detail="Unauthorized", headers={"WWW-Authenticate": "Basic"})
    return credentials.username
