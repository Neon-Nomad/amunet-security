
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, AlertTriangle, ShieldCheck, Zap, Wifi } from 'lucide-react';

interface Check {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  message?: string;
  required: boolean;
}

const TestConnectionButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Simulate a ping
      await new Promise(resolve => setTimeout(resolve, 1200));
      const isOnline = navigator.onLine; 
      
      if (isOnline) {
        setResult('success');
      } else {
        setResult('error');
      }
    } catch (error) {
      setResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <button
      onClick={testConnection}
      disabled={testing}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
        result === 'success' 
            ? 'bg-sentinel-success/10 border-sentinel-success/30 text-sentinel-success' 
            : result === 'error'
            ? 'bg-sentinel-danger/10 border-sentinel-danger/30 text-sentinel-danger'
            : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30 text-blue-400'
      }`}
    >
      {testing ? (
        <>
          <Loader className="w-3 h-3 animate-spin" />
          Pinging Control Plane...
        </>
      ) : result === 'success' ? (
        <>
          <Wifi className="w-3 h-3" />
          Latency: 24ms
        </>
      ) : result === 'error' ? (
        <>
          <XCircle className="w-3 h-3" />
          Unreachable
        </>
      ) : (
        <>
          <Zap className="w-3 h-3" />
          Test Connectivity
        </>
      )}
    </button>
  );
};

export const PreFlightChecks: React.FC<{ onComplete: (passed: boolean) => void }> = ({ onComplete }) => {
  const [checks, setChecks] = useState<Check[]>([
    { id: 'aws-creds', name: 'Cloud Credentials', status: 'pending', required: true },
    { id: 'iam-perms', name: 'IAM / RBAC Permissions', status: 'pending', required: true },
    { id: 'network', name: 'Outbound Connectivity (443)', status: 'pending', required: true },
    { id: 'ports', name: 'Dynamic Port Range (10000-20000)', status: 'pending', required: false },
    { id: 'disk', name: 'Disk Space (>1GB)', status: 'pending', required: true },
  ]);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    for (const check of checks) {
      setChecks(prev => prev.map(c => 
        c.id === check.id ? { ...c, status: 'running' } : c
      ));

      // Simulate checking delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

      const result = await performCheck(check.id);
      
      setChecks(prev => prev.map(c => 
        c.id === check.id ? { ...c, ...result } : c
      ));
    }

    const allRequired = checks.filter(c => c.required).every(c => c.status === 'success');
    // Add a small delay before proceeding so user sees the result
    setTimeout(() => {
        onComplete(allRequired);
    }, 1500);
  };

  const performCheck = async (checkId: string) => {
    const random = Math.random();
    
    // Simulate realistic results (mostly success for demo)
    if (random > 0.1) {
      return { status: 'success' as const, message: 'Verified' };
    } else if (random > 0.05 && checkId === 'ports') {
      return { 
        status: 'warning' as const, 
        message: 'Partial range blocked. Rotation might be limited.' 
      };
    } else if (random <= 0.05) {
      return { 
        status: 'error' as const, 
        message: 'Check failed. Please verify configuration.' 
      };
    }
    return { status: 'success' as const, message: 'Verified' };
  };

  const getIcon = (status: Check['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-sentinel-success" />;
      case 'error': return <XCircle className="w-5 h-5 text-sentinel-danger" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-sentinel-warning" />;
      case 'running': return <Loader className="w-5 h-5 text-sentinel-accent animate-spin" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-700" />;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-sentinel-accent" />
          <h3 className="text-lg font-bold text-white">Environment Pre-Flight Checks</h3>
        </div>
        <TestConnectionButton />
      </div>
      <div className="space-y-4">
        {checks.map(check => (
          <div key={check.id} className="flex items-center justify-between bg-gray-900/30 p-3 rounded-lg border border-gray-800/50">
            <div className="flex items-center gap-3">
              {getIcon(check.status)}
              <div>
                <div className="text-white font-medium text-sm">{check.name}</div>
                <div className={`text-xs ${
                  check.status === 'error' ? 'text-sentinel-danger' :
                  check.status === 'warning' ? 'text-sentinel-warning' :
                  check.status === 'success' ? 'text-sentinel-success' :
                  'text-gray-500'
                }`}>
                  {check.status === 'pending' ? 'Waiting...' : (check.message || 'Checking...')}
                </div>
              </div>
            </div>
            {check.required && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-600 bg-gray-900 px-2 py-1 rounded">Required</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
