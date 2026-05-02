import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mic, FileText, Settings, Activity, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { title: 'Live Chat Translator', desc: 'Real-time text translation between users', icon: MessageSquare, color: 'bg-blue-600', path: '/chat' },
    { title: 'Voice Translator', desc: 'Speak to translate instantly with AI voice', icon: Mic, color: 'bg-teal-500', path: '/voice' },
    { title: 'Chat History', desc: 'View past conversations and download PDFs', icon: FileText, color: 'bg-indigo-500', path: '/history' },
    { title: 'NLP Analytics', desc: 'Sentiment & emotion analysis of your chats', icon: Activity, color: 'bg-amber-500', path: '/analytics' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">Welcome to LinguaBridge</h1>
          <p className="text-slate-500 text-lg font-medium">Select a communication mode to get started.</p>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700 border border-slate-200">
          <Globe size={16} className="text-blue-600" />
          <span>System Status: <strong className="text-emerald-600">Online</strong></span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(card.path)}
            className="saas-card saas-card-hover p-6 cursor-pointer group flex flex-col"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 ${card.color} shadow-lg shadow-${card.color.replace('bg-', '')}/30 group-hover:scale-105 transition-transform`}>
              <card.icon size={26} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="saas-card p-8 mt-12 border-t-4 border-t-blue-600"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Translations</p>
            <p className="text-3xl font-bold text-blue-600 tracking-tight">1,248</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Languages Used</p>
            <p className="text-3xl font-bold text-teal-600 tracking-tight">12</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Accuracy</p>
            <p className="text-3xl font-bold text-indigo-600 tracking-tight">96.4%</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Top Pair</p>
            <p className="text-3xl font-bold text-amber-500 tracking-tight">EN → ES</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
