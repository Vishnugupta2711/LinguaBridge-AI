# LinguaBridge AI

**LinguaBridge AI** is a complete, production-style MVP for a real-time intelligent communication platform. It breaks language barriers using advanced NLP and Machine Learning for translation, speech-to-text, and sentiment analysis.

## 🚀 Features

- **Live Chat Translator**: Real-time bidirectional text translation.
- **Voice Translator**: Speak to translate using OpenAI Whisper and play audio translations.
- **Chat History**: Persisted history with PDF download support.
- **NLP Analytics**: Automated sentiment, emotion, and grammar analysis on your translations.
- **Premium UI**: Dark mode, dynamic layout, responsive design using TailwindCSS & Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React + Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Node.js, Express.js (JSON local storage)
- **AI Service**: Python, FastAPI, HuggingFace Transformers (MarianMT), Whisper, SpaCy, gTTS

## ⚙️ Setup Instructions

This project includes a unified setup and run script.

1. Install Python 3.10+, Node.js (v18+).
2. The installation was performed automatically. You just need to run the app.
3. Open a terminal in the root folder `LinguaBridge-AI` and run:

```bash
./start.sh
```

This will automatically:
1. Start the Express Backend on `http://localhost:5000`
2. Start the FastAPI AI Service on `http://localhost:8000`
3. Start the Vite React Frontend on `http://localhost:5173`

You can now visit `http://localhost:5173` in your browser.

## 📌 Usage Flow

1. Create an account or log in.
2. Select **Live Chat Translator** for text.
3. Select **Voice Translator** for speech (microphone access required).
4. Review your past translations in **Chat History**.
5. Check your usage metrics in **NLP Analytics**.

## 🛑 Note on Initial Run

The first time you run a translation or voice conversion, the AI Service will download the necessary model weights (e.g., Whisper tiny, MarianMT translation models). This may take a few minutes depending on your internet connection. Subsequent translations will be near-instantaneous.
