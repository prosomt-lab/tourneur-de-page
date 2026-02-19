"""Le Tourneur de Page — Backend API"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uuid
import os

from services import pdf_service
from services import ocr_service

app = FastAPI(
    title="Le Tourneur de Page",
    description="API pour la navigation intelligente de documents",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:7683"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("/home/openclaw/tourneur-de-page/data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "tourneur-de-page"}


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document (PDF, images, etc.)"""
    allowed = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".tiff"}
    suffix = Path(file.filename).suffix.lower()
    if suffix not in allowed:
        raise HTTPException(400, f"Type non supporte: {suffix}")

    doc_id = str(uuid.uuid4())[:8]
    doc_path = UPLOAD_DIR / f"{doc_id}{suffix}"
    content = await file.read()
    doc_path.write_bytes(content)

    page_count = None
    if suffix == ".pdf":
        try:
            page_count = pdf_service.get_page_count(str(doc_path))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get PDF page count: {e}")

    return {
        "docId": doc_id,
        "filename": file.filename,
        "size": len(content),
        "pages": page_count,
    }


@app.get("/api/documents/{doc_id}/pages/{page_num}")
async def get_page(doc_id: str, page_num: int):
    """Get a specific page from a document as an image and text"""
    # Find the document path
    doc_path = None
    for f in UPLOAD_DIR.iterdir():
        if f.name.startswith(doc_id):
            doc_path = f
            break

    if not doc_path:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check if it's a PDF
    if doc_path.suffix.lower() == ".pdf":
        try:
            image_bytes = pdf_service.get_page_image(str(doc_path), page_num)
            text_content = pdf_service.get_page_text(str(doc_path), page_num)
            return Response(content=image_bytes, media_type="image/png", headers={"X-Page-Text": text_content})
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to extract page from PDF: {e}")
    else:
        # For non-PDFs, currently return a placeholder or direct image if supported
        raise HTTPException(status_code=501, detail="Non-PDF document page extraction not yet implemented")


@app.get("/api/documents/{doc_id}/ocr/{page_num}")
async def ocr_page(doc_id: str, page_num: int):
    """OCR a page using Gemini Flash (free) and provide a summary"""
    doc_path = None
    for f in UPLOAD_DIR.iterdir():
        if f.name.startswith(doc_id):
            doc_path = f
            break

    if not doc_path:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc_path.suffix.lower() == ".pdf":
        try:
            image_bytes = pdf_service.get_page_image(str(doc_path), page_num)
            ocr_text = await ocr_service.ocr_page(image_bytes)
            summary = await ocr_service.summarize_page(ocr_text)
            return {"docId": doc_id, "page": page_num, "ocrText": ocr_text, "summary": summary}
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to perform OCR or summarize: {e}")
    else:
        raise HTTPException(status_code=501, detail="OCR for non-PDF documents not yet implemented")
