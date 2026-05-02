import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Volume2, Copy, Check, Sparkles, X, ClipboardPaste } from 'lucide-react';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';
import { aiApi, backendApi } from '../utils/api';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
];

const LiveTranslator = () => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentiment, setSentiment] = useState(null);

  // Debounced translation function for auto-translate
  const debouncedTranslate = useCallback(
    debounce(async (text, sLang, tLang) => {
      if (!text.trim()) {
        setTranslatedText('');
        setSentiment(null);
        return;
      }
      
      setIsLoading(true);
      try {
        const [translateRes, nlpRes] = await Promise.all([
          aiApi.post('/translate', { text, source_lang: sLang, target_lang: tLang }),
          aiApi.post('/analyze', { text })
        ]);
        
        const translated = translateRes.data.translated;
        const emotion = nlpRes.data.sentiment.emotion;
        
        setTranslatedText(translated);
        setSentiment(emotion);

        // Save to backend history silently
        backendApi.post('/chats', {
          sourceText: text,
          targetText: translated,
          sourceLang: sLang,
          targetLang: tLang,
          sentiment: emotion
        }).catch(err => console.error("History save error", err));

      } catch (error) {
        // Interceptors handle the toast notification
      } finally {
        setIsLoading(false);
      }
    }, 800),
    []
  );

  // Watch for changes to auto-translate
  useEffect(() => {
    if (sourceText.trim()) {
      debouncedTranslate(sourceText, sourceLang, targetLang);
    } else {
      setTranslatedText('');
      setSentiment(null);
    }
  }, [sourceText, sourceLang, targetLang, debouncedTranslate]);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success('Translation copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
      }
    } catch (err) {
      toast.error('Unable to paste from clipboard');
    }
  };

  const clearText = () => {
    setSourceText('');
  };

  const playAudio = async (text, lang) => {
    try {
      const res = await aiApi.post('/tts', { text, lang }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      // Toast handled by interceptor
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10">
      
      {/* Header Section */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles size={14} className="text-blue-500" />
            Real-Time AI Translation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">Live Translator</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">Instantly translate text across borders with human-level accuracy and sentiment awareness.</p>
        </div>
      </div>

      {/* Main Translator Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden relative flex flex-col md:flex-row">
        
        {/* Source Panel (Left) */}
        <div className="flex-1 flex flex-col p-6 md:p-8 bg-white relative z-0">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <select 
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 pl-4 pr-10 rounded-xl hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer w-48 shadow-sm"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            
            <div className="flex gap-2">
              <button 
                onClick={handlePaste}
                className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                title="Paste from clipboard"
              >
                <ClipboardPaste size={14} /> <span className="hidden sm:inline">Paste</span>
              </button>
              {sourceText && (
                <button 
                  onClick={clearText}
                  className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <X size={14} /> <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 relative group">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-full min-h-[220px] resize-none text-2xl md:text-3xl font-medium text-slate-800 placeholder:text-slate-300 bg-transparent border-none focus:outline-none focus:ring-0 p-0 leading-relaxed"
            />
          </div>

          {/* Footer Tools */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <button 
              onClick={() => playAudio(sourceText, sourceLang)}
              disabled={!sourceText}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              title="Listen to original text"
            >
              <Volume2 size={20} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {sourceText.length} <span className="hidden sm:inline">characters</span>
            </span>
          </div>
        </div>

        {/* Central Swap Button Overlay */}
        <div className="flex items-center justify-center -my-4 md:my-0 md:absolute md:top-[85px] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20">
          <button 
            onClick={handleSwap}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-500 rounded-full hover:text-blue-600 hover:border-blue-300 shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgb(37,99,235,0.15)] transition-all duration-300 hover:scale-105 active:scale-95 group"
            title="Swap languages"
          >
            <ArrowRightLeft size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Divider (Desktop only, subtle gradient) */}
        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent z-10"></div>
        {/* Mobile divider */}
        <div className="md:hidden h-px bg-slate-100 w-full"></div>

        {/* Target Panel (Right) */}
        <div className="flex-1 flex flex-col p-6 md:p-8 bg-slate-50/50 relative z-0">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold py-2.5 pl-4 pr-10 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer w-48 shadow-sm"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            
            {sentiment && (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border ${
                sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                sentiment === 'negative' ? 'bg-red-50 text-red-700 border-red-100' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {sentiment}
              </div>
            )}
          </div>
          
          {/* Output Area */}
          <div className="flex-1 relative flex flex-col min-h-[220px]">
            <div className={`flex-1 text-2xl md:text-3xl font-medium leading-relaxed whitespace-pre-wrap ${translatedText ? 'text-blue-900' : 'text-slate-400/50'}`}>
              {isLoading ? (
                <div className="animate-pulse flex flex-col space-y-4 mt-2">
                  <div className="h-6 bg-slate-200/60 rounded w-3/4"></div>
                  <div className="h-6 bg-slate-200/60 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200/60 rounded w-5/6"></div>
                </div>
              ) : translatedText ? (
                translatedText
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-60">
                  <span className="text-xl">Translation will appear here</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Tools */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/60">
            <div className="flex gap-2">
              <button 
                onClick={() => playAudio(translatedText, targetLang)}
                disabled={!translatedText}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                title="Listen to translation"
              >
                <Volume2 size={20} />
              </button>
            </div>
            
            <button 
              onClick={copyToClipboard}
              disabled={!translatedText}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                copied 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm disabled:hover:border-slate-200'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTranslator;
