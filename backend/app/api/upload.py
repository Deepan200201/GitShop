import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings
import shutil
import uuid

router = APIRouter()

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Create uploads dir if not exists
        if not os.path.exists(settings.UPLOAD_DIR):
            os.makedirs(settings.UPLOAD_DIR)

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return URL
        # Assuming the backend is mounted at /api/v1, but static files are mounted at root /uploads
        # We need to construct the full URL. Ideally, this should be a full URL if frontend and backend are on different ports.
        # For now, we'll return a relative path that the frontend can prepend with the backend URL if needed,
        # or an absolute URL if we know the host.
        # Let's return a relative path from the server root.
        return {"url": f"/uploads/{unique_filename}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
