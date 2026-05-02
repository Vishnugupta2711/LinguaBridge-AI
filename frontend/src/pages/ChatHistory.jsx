import React, { useEffect, useState } from 'react';
import { Download, Clock, Languages, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { backendApi } from '../utils/api';
import toast from 'react-hot-toast';

const ChatHistory = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await backendApi.get('/chats');
        setChats(res.data.reverse()); // latest first
      } catch (error) {
        toast.error('Failed to fetch chat history');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("LinguaBridge Translation History", 20, 20);
      
      let yPos = 40;
      doc.setFontSize(12);
      
      chats.forEach((chat, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const date = new Date(chat.timestamp).toLocaleString();
        doc.setFont(undefined, 'bold');
        doc.text(`${date} [${chat.sourceLang.toUpperCase()} -> ${chat.targetLang.toUpperCase()}]`, 20, yPos);
        yPos += 7;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Source: ${chat.sourceText}`, 20, yPos, { maxWidth: 170 });
        yPos += 7 * Math.ceil(chat.sourceText.length / 80);
        
        doc.text(`Translation: ${chat.targetText}`, 20, yPos, { maxWidth: 170 });
        yPos += 10 * Math.ceil(chat.targetText.length / 80);
        
        doc.setDrawColor(200);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
      });

      doc.save('linguabridge-history.pdf');
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const SkeletonLoader = () => (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="saas-card p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
            <div className="h-5 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-3 bg-slate-200 rounded w-1/6"></div>
              <div className="h-5 bg-slate-200 rounded w-full"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-slate-200 rounded w-1/6"></div>
              <div className="h-5 bg-slate-200 rounded w-full"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Translation History</h1>
          <p className="text-slate-500 mt-2 font-medium">Review and export your past translations.</p>
        </div>
        <button 
          onClick={downloadPDF}
          disabled={chats.length === 0 || loading}
          className="btn-secondary-saas flex items-center justify-center gap-2 h-11 disabled:opacity-50"
        >
          <Download size={18} /> Export PDF
        </button>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : chats.length === 0 ? (
        <div className="saas-card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No history yet</h3>
          <p className="text-slate-500 max-w-sm">Start translating text or voice to see your records appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {chats.map(chat => (
            <div key={chat.id} className="saas-card saas-card-hover p-6">
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Languages size={18} />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="uppercase tracking-wide">{chat.sourceLang}</span>
                    <span className="text-slate-300">→</span>
                    <span className="uppercase tracking-wide">{chat.targetLang}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Clock size={14} />
                  {new Date(chat.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Original</p>
                  <p className="text-lg text-slate-800 font-medium">{chat.sourceText}</p>
                </div>
                <div className="relative">
                  <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-px bg-slate-100"></div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Translation</p>
                  <p className="text-lg text-blue-900 font-medium">{chat.targetText}</p>
                </div>
              </div>

              {chat.sentiment && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sentiment:</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    chat.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    chat.sentiment === 'negative' ? 'bg-red-50 text-red-600 border border-red-100' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {chat.sentiment.charAt(0).toUpperCase() + chat.sentiment.slice(1)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
