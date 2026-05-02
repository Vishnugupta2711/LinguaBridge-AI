import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Volume2, AlertCircle } from 'lucide-react';
import { aiApi, backendApi } from '../utils/api';
import toast from 'react-hot-toast';

const VoiceTranslator = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [sttText, setSttText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [micError, setMicError] = useState('');
  
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setMicError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStopRecording;

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setMicError("Microphone access denied. Please allow permissions.");
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    
    // Process audio
    await processAudio(audioBlob);
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // 1. STT (Whisper)
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      const sttRes = await aiApi.post('/stt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const transcribedText = sttRes.data.text;
      
      if (!transcribedText.trim()) {
        toast.error("Could not hear anything clearly. Try again.");
        setIsProcessing(false);
        return;
      }
      
      setSttText(transcribedText);

      // 2. Translate
      const transRes = await aiApi.post('/translate', { 
        text: transcribedText, 
        source_lang: sourceLang, 
        target_lang: targetLang 
      });
      const translated = transRes.data.translated;
      setTranslatedText(translated);

      // Save History
      backendApi.post('/chats', {
        sourceText: transcribedText,
        targetText: translated,
        sourceLang: sourceLang,
        targetLang: targetLang,
      }).catch(err => console.error(err));

      // 3. Play TTS
      const ttsRes = await aiApi.post('/tts', 
        { text: translated, lang: targetLang }, 
        { responseType: 'blob' }
      );
      
      const ttsBlob = ttsRes.data;
      const ttsUrl = URL.createObjectURL(ttsBlob);
      const audio = new Audio(ttsUrl);
      audio.play();

    } catch (error) {
      // Error handled by interceptor
    } finally {
      setIsProcessing(false);
    }
  };

  // Wave visualizer component
  const WaveForm = () => (
    <div className="flex items-center gap-1 mt-8 h-10">
      {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
        <motion.div
          key={bar}
          animate={{ height: isRecording ? ["20%", "100%", "20%"] : "20%" }}
          transition={{ duration: 0.8, repeat: Infinity, delay: bar * 0.1 }}
          className="w-1.5 bg-blue-600 rounded-full h-full"
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Voice Translator</h1>
        <p className="text-slate-500 mt-2 font-medium">Speak naturally and hear the translation instantly.</p>
      </div>

      <div className="saas-card p-10 flex flex-col items-center">
        
        {micError && (
          <div className="mb-6 w-full max-w-md p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{micError}</p>
          </div>
        )}

        <div className="flex gap-6 mb-10 w-full max-w-md bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">I speak</label>
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="input-saas py-2 bg-white">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Translate to</label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="input-saas py-2 bg-white">
              <option value="es">Spanish</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center">
          {/* Subtle pulse behind the button when recording */}
          {isRecording && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-red-500 rounded-full w-32 h-32"
            />
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors duration-300 disabled:opacity-50 ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRecording ? <Square size={40} fill="white" className="text-white" /> : <Mic size={48} className="text-white" />}
          </motion.button>
        </div>
        
        {isRecording ? <WaveForm /> : (
          <p className="mt-8 text-slate-400 font-medium tracking-wide uppercase text-sm">
            Tap to start speaking
          </p>
        )}

        {isProcessing && (
          <div className="mt-8 flex items-center gap-2 text-blue-600">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-3 font-semibold tracking-tight text-slate-700">AI is processing...</span>
          </div>
        )}

        <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 min-h-[160px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <h3 className="text-xs text-slate-500 uppercase tracking-wider font-bold">You said</h3>
            </div>
            <p className="text-xl font-medium text-slate-800">{sttText || <span className="text-slate-400/70 italic font-normal">Waiting for speech...</span>}</p>
          </div>
          
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 min-h-[160px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h3 className="text-xs text-blue-600 uppercase tracking-wider font-bold">Translation</h3>
            </div>
            <p className="text-xl font-medium text-slate-900">{translatedText || <span className="text-slate-400/70 italic font-normal">Translation will appear here...</span>}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoiceTranslator;
