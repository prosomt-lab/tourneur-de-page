import google.generativeai as genai
import os
import io
from PIL import Image

# Configure Gemini API key
# It's recommended to set GOOGLE_API_KEY as an environment variable.
# For local testing, you might load it from a .env file or similar,
# but for deployment, environment variables are preferred.
if "GOOGLE_API_KEY" not in os.environ:
    print("WARNING: GOOGLE_API_KEY environment variable not set. OCR service may not function.")
    # In a real scenario, you might want to raise an error or halt execution.

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

async def ocr_page(image_bytes: bytes) -> str:
    """Performs OCR on an image using Gemini Flash and returns the extracted text."""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Convert bytes to PIL Image, then to a format suitable for Gemini
        image = Image.open(io.BytesIO(image_bytes))
        
        # The model expects a list of content parts
        response = await model.generate_content_async(["Extract all text from this image:", image])
        
        return response.text
    except Exception as e:
        print(f"Error during OCR with Gemini Flash: {e}")
        raise

async def summarize_page(text: str) -> str:
    """Summarizes the given text using Gemini Flash."""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = await model.generate_content_async(f"Summarize the following text:

{text}")
        return response.text
    except Exception as e:
        print(f"Error during summarization with Gemini Flash: {e}")
        raise