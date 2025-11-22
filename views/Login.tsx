
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Lock, Loader2, ArrowLeft } from 'lucide-react';

interface LoginProps {
    onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack }) => {
  const [email, setEmail] = useState('demo@amunet.ai');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sentinel-accent to-transparent animate-scan"></div>
      
      <div className="max-w-md w-full mx-4 relative z-10">
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-8 left-0 md:-left-12 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
                <ArrowLeft size={16} /> Back to Amunet.ai
            </button>
        )}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <ShieldAlert className="w-12 h-12 text-sentinel-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AMUNET<span className="text-sentinel-accent">AI</span></h1>
          <p className="text-gray-400">Autonomous Infrastructure Defense</p>
        </div>

        <div className="glass-panel backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Official Email
              </label>
              <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sentinel-accent transition-colors pl-10"
                    placeholder="name@company.com"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Access Key / Password
              </label>
              <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sentinel-accent transition-colors pl-10"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-sentinel-danger/10 border border-sentinel-danger/30 rounded-lg text-sentinel-danger text-xs flex items-center gap-2">
                <ShieldAlert size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sentinel-accent hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Authenticate'}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-500 mb-2">Public Demo Credentials</p>
              <code className="bg-gray-900 px-2 py-1 rounded text-xs text-sentinel-accent font-mono">demo@amunet.ai / demo123</code>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
