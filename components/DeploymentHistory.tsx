
import React from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight, History } from 'lucide-react';

export interface DeploymentAttempt {
  id: string;
  timestamp: number;
  status: 'success' | 'failed';
  method: string;
  agentId?: string;
  error?: string;
  duration: number; // seconds
}

export const DeploymentHistory: React.FC<{ attempts: DeploymentAttempt[] }> = ({ attempts }) => {
  return (
    <div className="glass-panel rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <History className="text-gray-400" size={20} />
        Deployment History
      </h3>
      
      {attempts.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No previous deployment attempts found.</p>
      ) : (
        <div className="space-y-3">
          {attempts.map(attempt => (
            <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                {attempt.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-sentinel-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-sentinel-danger" />
                )}
                <div>
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    {attempt.method} Deployment
                    {attempt.agentId && <span className="text-xs font-mono text-gray-500">({attempt.agentId})</span>}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{attempt.duration}s duration</span>
                  </div>
                  {attempt.error && (
                    <div className="text-xs text-sentinel-danger mt-1">{attempt.error}</div>
                  )}
                </div>
              </div>
              
              {attempt.status === 'success' && attempt.agentId && (
                <button className="text-sentinel-accent hover:text-white text-xs flex items-center gap-1">
                  View Agent <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
