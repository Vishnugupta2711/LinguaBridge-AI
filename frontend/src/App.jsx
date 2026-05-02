import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Languages, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Lazy loaded components for code splitting (Performance Upgrade)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const LiveTranslator = React.lazy(() => import('./pages/LiveTranslator'));
const VoiceTranslator = React.lazy(() => import('./pages/VoiceTranslator'));
const ChatHistory = React.lazy(() => import('./pages/ChatHistory'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Premium skeleton loader during lazy load
  const PageLoader = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }
        }} />
        
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4 flex justify-between items-center transition-all">
          <div className="container mx-auto flex justify-between items-center max-w-6xl">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-[0_2px_10px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform">
                <Languages size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                LinguaBridge<span className="text-blue-600">.</span>
              </h1>
            </Link>
            
            <div className="flex items-center gap-6">
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setAuth={setIsAuthenticated} />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/chat" element={isAuthenticated ? <LiveTranslator /> : <Navigate to="/login" />} />
              <Route path="/voice" element={isAuthenticated ? <VoiceTranslator /> : <Navigate to="/login" />} />
              <Route path="/history" element={isAuthenticated ? <ChatHistory /> : <Navigate to="/login" />} />
              <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
              <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
