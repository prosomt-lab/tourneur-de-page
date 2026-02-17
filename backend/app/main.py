"""Le Tourneur de Page — Backend API"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uuid

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
    dest = UPLOAD_DIR / f"{doc_id}{suffix}"
    content = await file.read()
    dest.write_bytes(content)

    return {
        "docId": doc_id,
        "filename": file.filename,
        "size": len(content),
        "pages": None,  # TODO: extract page count
    }


@app.get("/api/documents/{doc_id}/pages/{page_num}")
async def get_page(doc_id: str, page_num: int):
    """Get a specific page from a document"""
    # TODO: implement page extraction with PyMuPDF
    return {"docId": doc_id, "page": page_num, "content": "TODO"}


@app.get("/api/documents/{doc_id}/ocr/{page_num}")
async def ocr_page(doc_id: str, page_num: int):
    """OCR a page using Gemini Flash (free)"""
    # TODO: implement OCR with Gemini Flash
    return {"docId": doc_id, "page": page_num, "text": "TODO"}
