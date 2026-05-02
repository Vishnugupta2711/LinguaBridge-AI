from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import shutil
import logging

from ml.translator import translate_text, detect_language
from ml.audio import speech_to_text, text_to_speech
from ml.nlp import analyze_sentiment, extract_entities, summarize_text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="LinguaBridge AI Service")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMP_DIR = "tmp"
os.makedirs(TMP_DIR, exist_ok=True)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Error on {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "An internal AI service error occurred. Please try again."}
    )

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = None
    target_lang: str

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "AI Service"}

@app.post("/translate")
def translate(req: TranslateRequest):
    try:
        source = req.source_lang
        if not source:
            source = detect_language(req.text)
            
        translated = translate_text(req.text, source, req.target_lang)
        return {
            "original": req.text,
            "translated": translated,
            "source_lang": source,
            "target_lang": req.target_lang
        }
    except Exception as e:
        logger.error(f"Translation Error: {str(e)}")
        raise e

@app.post("/stt")
async def stt(file: UploadFile = File(...)):
    file_path = os.path.join(TMP_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        text = speech_to_text(file_path)
        return {"text": text}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

class TTSRequest(BaseModel):
    text: str
    lang: str

@app.post("/tts")
def tts(req: TTSRequest):
    output_filename = f"tts_{hash(req.text)}.mp3"
    output_path = os.path.join(TMP_DIR, output_filename)
    
    result_path = text_to_speech(req.text, req.lang, output_path)
    if result_path and os.path.exists(result_path):
        return FileResponse(result_path, media_type="audio/mpeg", filename=output_filename)
    return JSONResponse(status_code=500, content={"error": "Failed to generate speech"})

class NLPRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze(req: NLPRequest):
    sentiment = analyze_sentiment(req.text)
    entities = extract_entities(req.text)
    summary = summarize_text(req.text)
    
    return {
        "sentiment": sentiment,
        "entities": entities,
        "summary": summary
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
