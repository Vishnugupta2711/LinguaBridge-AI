import spacy
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import logging

logger = logging.getLogger(__name__)

logger.info("Loading SpaCy and NLTK...")
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.error("SpaCy model en_core_web_sm not found. Run: python -m spacy download en_core_web_sm")
    nlp = None

try:
    sia = SentimentIntensityAnalyzer()
except Exception as e:
    logger.error(f"NLTK vader_lexicon not found: {e}. Ensure it is downloaded.")
    sia = None

def analyze_sentiment(text: str):
    """Analyzes sentiment of text."""
    if not sia:
        return {"compound": 0, "status": "analyzer not loaded", "emotion": "neutral"}
        
    if not text or len(text.strip()) == 0:
        return {"compound": 0, "status": "empty text", "emotion": "neutral"}
    
    try:
        scores = sia.polarity_scores(text)
        
        if scores['compound'] >= 0.05:
            emotion = "positive"
        elif scores['compound'] <= -0.05:
            emotion = "negative"
        else:
            emotion = "neutral"
            
        return {
            "scores": scores,
            "emotion": emotion
        }
    except Exception as e:
        logger.error(f"Sentiment Analysis Error: {e}")
        return {"compound": 0, "status": "error", "emotion": "neutral"}

def extract_entities(text: str):
    """Extracts named entities from text using SpaCy."""
    if not nlp or not text:
        return []
        
    try:
        doc = nlp(text)
        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        return entities
    except Exception as e:
        logger.error(f"Entity Extraction Error: {e}")
        return []

def summarize_text(text: str) -> str:
    """Provides a very basic summary or extracts main sentences."""
    if not text:
        return ""
        
    if not nlp:
        return text[:100] + "..." if len(text) > 100 else text
        
    try:
        doc = nlp(text)
        sentences = list(doc.sents)
        if len(sentences) <= 1:
            return text
        
        # Return the first sentence as a mock summary
        return str(sentences[0])
    except Exception as e:
        logger.error(f"Summarization Error: {e}")
        return text[:100] + "..." if len(text) > 100 else text
