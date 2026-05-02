import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { backendApi } from '../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await backendApi.get('/chats/analytics');
        setStats(res.data);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const SkeletonLoader = () => (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="saas-card p-6 border-t-4 border-slate-200">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
      <div className="saas-card p-8 mt-8">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
          <Activity size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Failed to load analytics</h3>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shadow-sm">
          <BarChart3 size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">NLP Analytics</h1>
          <p className="text-slate-500 font-medium">Understand the sentiment of your global conversations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="saas-card saas-card-hover p-6 border-t-4 border-t-blue-600"
        >
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Translations</p>
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">{stats.totalTranslations}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="saas-card saas-card-hover p-6 border-t-4 border-t-teal-500"
        >
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Languages Used</p>
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">{stats.languagesCount}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="saas-card saas-card-hover p-6 border-t-4 border-t-indigo-500"
        >
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Accuracy Score</p>
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">{stats.accuracy}%</h2>
        </motion.div>
      </div>

      <div className="saas-card p-8 mt-12">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Translations</h3>
        {stats.recentConversations && stats.recentConversations.length > 0 ? (
          <div className="space-y-4">
            {stats.recentConversations.map((chat, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="mb-4 md:mb-0">
                  <p className="font-semibold text-slate-800 text-lg mb-1">{chat.sourceText.substring(0, 50)}{chat.sourceText.length > 50 ? '...' : ''}</p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    {chat.sourceLang} <span className="text-blue-500 font-extrabold">→</span> {chat.targetLang}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border
                    ${chat.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      chat.sentiment === 'negative' ? 'bg-red-50 text-red-600 border-red-100' : 
                      'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {chat.sentiment === 'positive' && <TrendingUp size={16} />}
                    {chat.sentiment === 'negative' && <TrendingDown size={16} />}
                    {chat.sentiment === 'neutral' && <Minus size={16} />}
                    <span className="uppercase tracking-wider">{chat.sentiment || 'neutral'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <p className="text-slate-500 font-medium">No recent translations to analyze.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
