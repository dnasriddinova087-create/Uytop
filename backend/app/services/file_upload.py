import os
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile, status
from app.config import settings

def save_uploaded_image(upload_file: UploadFile) -> str:
    """Validate and store an uploaded image safely."""
    # Check mime type
    if upload_file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faqat quyidagi formatdagi rasmlar ruxsat etilgan: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )
    
    # Read file content to check size
    contents = upload_file.file.read()
    if len(contents) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rasm hajmi {settings.MAX_IMAGE_SIZE_BYTES // (1024*1024)}MB dan oshmasligi kerak"
        )
    
    # Determine extension
    ext_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }
    ext = ext_map.get(upload_file.content_type, ".jpg")
    
    # Unique safe filename
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = settings.UPLOAD_DIR / filename
    
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Return accessible static URL
    return f"/uploads/{filename}"

def delete_uploaded_image(image_url: str):
    """Delete an image file from storage if it exists."""
    if not image_url or not image_url.startswith("/uploads/"):
        return
    filename = image_url.replace("/uploads/", "")
    file_path = settings.UPLOAD_DIR / filename
    if file_path.exists():
        try:
            os.remove(file_path)
        except Exception:
            pass
