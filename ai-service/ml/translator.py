from transformers import MarianMTModel, MarianTokenizer
from langdetect import detect, detect_langs
import functools
import logging

logger = logging.getLogger(__name__)

# Cache models to avoid reloading
_model_cache = {}
_tokenizer_cache = {}

def get_model_and_tokenizer(source_lang: str, target_lang: str):
    """Loads and caches the MarianMT model for a language pair."""
    # Special handling for common pairs. MarianMT uses specific model names.
    # Format: Helsinki-NLP/opus-mt-{src}-{tgt}
    
    model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
    
    if model_name in _model_cache:
        return _model_cache[model_name], _tokenizer_cache[model_name]
        
    try:
        logger.info(f"Loading translation model: {model_name}...")
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        
        _tokenizer_cache[model_name] = tokenizer
        _model_cache[model_name] = model
        logger.info("Loaded successfully.")
        return model, tokenizer
    except Exception as e:
        logger.error(f"Error loading model {model_name}: {e}")
        # Try english as pivot if direct pair fails (simplified)
        if source_lang != "en" and target_lang != "en":
            logger.info("Trying fallback to English pivot... (not fully implemented in MVP, returning None)")
        return None, None

def detect_language(text: str) -> str:
    """Detects the language of the given text."""
    if not text or len(text.strip()) < 3:
        return "en" # Default for very short text
    try:
        langs = detect_langs(text)
        if langs:
            return langs[0].lang
        return "en"
    except:
        return "en" # default to english

@functools.lru_cache(maxsize=1000)
def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Translates text using MarianMT with LRU caching."""
    if source_lang == target_lang:
        return text
        
    model, tokenizer = get_model_and_tokenizer(source_lang, target_lang)
    
    if not model or not tokenizer:
        return f"Translation from {source_lang} to {target_lang} is currently unavailable locally."
        
    try:
        inputs = tokenizer(text, return_tensors="pt", padding=True)
        translated = model.generate(**inputs)
        translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
        return translated_text
    except Exception as e:
        logger.error(f"Translation Error: {e}")
        return f"Error during translation: {e}"
