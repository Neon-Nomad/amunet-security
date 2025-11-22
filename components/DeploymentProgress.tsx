
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader, Circle, Terminal } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  duration?: number; // seconds
}

interface DeploymentProgressProps {
    onComplete: () => void;
    onError: () => void;
}

export const DeploymentProgress: React.FC<DeploymentProgressProps> = ({ onComplete, onError }) => {
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', title: 'Downloading Amunet Agent', description: 'Fetching latest binary from secure repo...', status: 'pending' },
    { id: '2', title: 'Installing Dependencies', description: 'Configuring iptables, systemd, and net-tools...', status: 'pending' },
    { id: '3', title: 'Verifying IAM Role', description: 'Checking AWS permission policies...', status: 'pending' },
    { id: '4', title: 'Starting Agent Service', description: 'Initializing daemon and connecting to control plane...', status: 'pending' },
    { id: '5', title: 'Awaiting First Heartbeat', description: 'Waiting for agent handshake...', status: 'pending' },
  ]);

  const [currentLog, setCurrentLog] = useState<string[]>(["> Initializing deployment sequence..."]);

  useEffect(() => {
    simulateDeployment();
  }, []);

  const addLog = (msg: string) => {
      setCurrentLog(prev => [...prev.slice(-4), `> ${msg}`]);
  }

  const simulateDeployment = async () => {
    for (let i = 0; i < steps.length; i++) {
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'in-progress' } : s
      ));
      
      addLog(`Step ${i+1}: ${steps[i].title} initiated.`);

      // Simulate step taking time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

      // 5% chance of failure on step 3
      if (i === 2 && Math.random() < 0.05) {
          setSteps(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error' } : s
          ));
          addLog(`ERROR: ${steps[i].title} failed.`);
          onError();
          return;
      }

      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'complete', duration: 2 + Math.floor(Math.random() * 3) } : s
      ));
      addLog(`Step ${i+1} complete.`);
    }
    addLog("Deployment sequence finished successfully.");
    setTimeout(onComplete, 1000);
  };

  return (
    <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Loader className="animate-spin text-sentinel-accent" />
            Deployment In Progress
        </h3>
        <div className="space-y-6 relative">
            {/* Connecting Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-800 -z-10"></div>

            {steps.map((step, idx) => (
            <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center bg-[#0B0F19] z-10 py-1">
                {step.status === 'complete' ? (
                    <CheckCircle className="w-6 h-6 text-sentinel-success" />
                ) : step.status === 'in-progress' ? (
                    <Loader className="w-6 h-6 text-sentinel-accent animate-spin" />
                ) : step.status === 'error' ? (
                    <div className="w-6 h-6 rounded-full bg-sentinel-danger flex items-center justify-center text-white text-xs">!</div>
                ) : (
                    <Circle className="w-6 h-6 text-gray-700" />
                )}
                </div>
                <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                    <h4 className={`font-medium text-sm ${
                    step.status === 'complete' ? 'text-sentinel-success' :
                    step.status === 'in-progress' ? 'text-white' :
                    step.status === 'error' ? 'text-sentinel-danger' :
                    'text-gray-500'
                    }`}>
                    {step.title}
                    </h4>
                    {step.duration && (
                    <span className="text-xs font-mono text-gray-600">{step.duration}s</span>
                    )}
                </div>
                <p className={`text-xs ${
                    step.status === 'in-progress' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                    {step.description}
                </p>
                </div>
            </div>
            ))}
        </div>
        </div>
        
        {/* Live Terminal Log */}
        <div className="bg-black/80 rounded-lg border border-gray-800 p-4 font-mono text-xs text-green-500 h-32 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 text-gray-500 border-b border-gray-800 pb-2 mb-2">
                <Terminal size={12} />
                <span>installer.log</span>
            </div>
            <div className="space-y-1 flex-1">
                {currentLog.map((log, i) => (
                    <div key={i} className="animate-in slide-in-from-left-2">{log}</div>
                ))}
                <div className="animate-pulse">_</div>
            </div>
        </div>
    </div>
  );
};
