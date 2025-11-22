import React, { useState } from 'react';
import { Lock, ShieldCheck, UserX, Globe, Fingerprint, AlertTriangle, Search, MoreHorizontal } from 'lucide-react';
import { MOCK_SESSIONS } from '../constants';
import { ZeroTrustSession } from '../types';

const ZeroTrust: React.FC = () => {
  const [sessions, setSessions] = useState<ZeroTrustSession[]>(MOCK_SESSIONS);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTerminate = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Terminated', riskScore: 0 } : s));
  };

  const handleChallenge = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Challenged' } : s));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Lock className="text-sentinel-accent" />
          Zero Trust Access (ZTNA)
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Continuous verification. Never trust, always verify. Real-time risk scoring for every active session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border-l-4 border-sentinel-success">
           <div className="flex items-center justify-between mb-2">
             <div className="text-gray-400 text-xs uppercase font-bold">Active Sessions</div>
             <Globe size={18} className="text-sentinel-success" />
           </div>
           <div className="text-3xl font-mono font-bold text-white">{sessions.filter(s => s.status === 'Active').length}</div>
           <div className="text-xs text-gray-500 mt-2">Global Context Aware</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-sentinel-warning">
           <div className="flex items-center justify-between mb-2">
             <div className="text-gray-400 text-xs uppercase font-bold">Avg Risk Score</div>
             <ShieldCheck size={18} className="text-sentinel-warning" />
           </div>
           <div className="text-3xl font-mono font-bold text-white">12.4</div>
           <div className="text-xs text-gray-500 mt-2">Baseline: Low Risk</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-sentinel-danger">
           <div className="flex items-center justify-between mb-2">
             <div className="text-gray-400 text-xs uppercase font-bold">Auto-Blocked (24h)</div>
             <UserX size={18} className="text-sentinel-danger" />
           </div>
           <div className="text-3xl font-mono font-bold text-white">41</div>
           <div className="text-xs text-gray-500 mt-2">Policy Enforced</div>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-white">Live Session Monitor</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Filter users or IPs..." 
              className="bg-gray-900 border border-gray-700 rounded pl-9 pr-3 py-1.5 text-xs text-gray-300 focus:border-sentinel-accent focus:outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase">
                <th className="p-4 font-medium">User / Identity</th>
                <th className="p-4 font-medium">Device & Location</th>
                <th className="p-4 font-medium">Resource</th>
                <th className="p-4 font-medium">Risk Score</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-800">
              {sessions.map(session => (
                <tr key={session.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{session.user}</div>
                    <div className="text-xs text-gray-500">{session.role}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300 flex items-center gap-1.5">
                      <Fingerprint size={12} /> {session.device}
                    </div>
                    <div className="text-xs text-gray-500">{session.ip} • {session.location}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-xs bg-gray-800 px-2 py-1 rounded w-fit text-gray-300">
                      {session.resourceAccessed}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-800 rounded-full h-1.5 w-16">
                        <div 
                          className={`h-1.5 rounded-full ${
                            session.riskScore > 75 ? 'bg-sentinel-danger' : 
                            session.riskScore > 40 ? 'bg-sentinel-warning' : 'bg-sentinel-success'
                          }`} 
                          style={{ width: `${session.riskScore}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono font-bold ${
                         session.riskScore > 75 ? 'text-sentinel-danger' : 
                         session.riskScore > 40 ? 'text-sentinel-warning' : 'text-sentinel-success'
                      }`}>
                        {session.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      session.status === 'Active' ? 'bg-sentinel-success/10 text-sentinel-success border-sentinel-success/20' :
                      session.status === 'Flagged' ? 'bg-sentinel-danger/10 text-sentinel-danger border-sentinel-danger/20 animate-pulse' :
                      session.status === 'Terminated' ? 'bg-gray-800 text-gray-500 border-gray-700' :
                      'bg-sentinel-warning/10 text-sentinel-warning border-sentinel-warning/20'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {session.status !== 'Terminated' && (
                        <>
                          <button 
                            onClick={() => handleChallenge(session.id)}
                            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                            title="Force MFA Challenge"
                          >
                            <Lock size={16} />
                          </button>
                          <button 
                            onClick={() => handleTerminate(session.id)}
                            className="p-1.5 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500"
                            title="Terminate Session"
                          >
                            <UserX size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ZeroTrust;