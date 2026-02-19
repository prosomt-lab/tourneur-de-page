import fitz  # PyMuPDF
from typing import List, Dict, Any
import io

def get_page_count(doc_path: str) -> int:
    try:
        doc = fitz.open(doc_path)
        count = doc.page_count
        doc.close()
        return count
    except Exception as e:
        print(f"Error getting page count for {doc_path}: {e}")
        raise

def get_page_image(doc_path: str, page_num: int) -> bytes:
    try:
        doc = fitz.open(doc_path)
        if not 0 <= page_num < doc.page_count:
            doc.close()
            raise ValueError(f"Page number {page_num} out of range for document with {doc.page_count} pages.")
        
        page = doc.load_page(page_num)
        
        # Render page to an image (PNG format)
        pix = page.get_pixmap()
        img_bytes = pix.pil_tobytes(format="PNG") # Use pil_tobytes for direct bytes
        
        doc.close()
        return img_bytes
    except Exception as e:
        print(f"Error getting page image for {doc_path}, page {page_num}: {e}")
        raise

def get_page_text(doc_path: str, page_num: int) -> str:
    try:
        doc = fitz.open(doc_path)
        if not 0 <= page_num < doc.page_count:
            doc.close()
            raise ValueError(f"Page number {page_num} out of range for document with {doc.page_count} pages.")
        
        page = doc.load_page(page_num)
        text = page.get_text("text")
        doc.close()
        return text
    except Exception as e:
        print(f"Error getting page text for {doc_path}, page {page_num}: {e}")
        raise
