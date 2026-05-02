import whisper
from gtts import gTTS
import os
import logging

logger = logging.getLogger(__name__)

# Load whisper model globally so it doesn't reload on every request
# 'tiny' is used for faster inference on local machines, can be changed to 'base' or 'small'
logger.info("Loading Whisper model (tiny)...")
try:
    stt_model = whisper.load_model("tiny")
    logger.info("Whisper model loaded.")
except Exception as e:
    logger.error(f"Error loading whisper: {e}")
    stt_model = None

def speech_to_text(audio_path: str) -> str:
    """Converts audio file to text using Whisper."""
    if stt_model is None:
        return "Error: STT model not loaded."
    
    if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
        logger.warning("Empty or non-existent audio file provided.")
        return ""

    try:
        # transcribe
        result = stt_model.transcribe(audio_path, fp16=False)
        return result["text"].strip()
    except Exception as e:
        logger.error(f"Whisper Transcription Error: {e}")
        return "Error processing audio."

def text_to_speech(text: str, lang_code: str, output_path: str) -> str:
    """Converts text to speech using gTTS and saves to output_path."""
    if not text or len(text.strip()) == 0:
        return None
        
    try:
        # gTTS uses ISO 639-1 language codes (e.g., 'en', 'es', 'fr')
        # If lang_code is not supported, it might throw an error. We default to 'en' if it fails.
        try:
            tts = gTTS(text=text, lang=lang_code, slow=False)
        except ValueError:
            # Fallback to english if language is unsupported by gTTS
            tts = gTTS(text=text, lang='en', slow=False)
            
        tts.save(output_path)
        return output_path
    except Exception as e:
        logger.error(f"TTS Error: {e}")
        return None
