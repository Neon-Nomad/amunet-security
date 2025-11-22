
import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Eye, Lock, Zap, Activity, MapPin, Loader2, Brain, Database, GitBranch, RefreshCcw, Terminal } from 'lucide-react';
import { INITIAL_THREATS } from '../constants';
import { motion } from 'framer-motion';
import { amunetApi } from '../services/AmunetAPI';

const ThreatIntelligence: React.FC = () => {
  const [threats, setThreats] = useState(INITIAL_THREATS);
  const [tracingId, setTracingId] = useState<string | null>(null);
  
  // Training State
  const [modelConfidence, setModelConfidence] = useState(99.92);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  const radarData = [
    { subject: 'DDoS', A: 120, fullMark: 150 },
    { subject: 'SQLi', A: 98, fullMark: 150 },
    { subject: 'XSS', A: 86, fullMark: 150 },
    { subject: 'Phishing', A: 99, fullMark: 150 },
    { subject: 'Brute Force', A: 85, fullMark: 150 },
    { subject: 'Zero Day', A: 65, fullMark: 150 },
  ];

  const handleTrace = async (id: string, ip: string) => {
    setTracingId(id);
    (window as any).showNotification('info', 'Trace Initiated', `Triangulating network path for ${ip}...`);
    
    try {
        // Simulate delay for effect
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const result = await amunetApi.traceHost(ip);
        
        (window as any).showNotification(
            'success', 
            'Origin Resolved', 
            `${result.isp} (${result.city}, ${result.country})`
        );
        
        // Update local state to show "Resolved"
        setThreats(prev => prev.map(t => 
            t.id === id ? { ...t, location: `${result.city}, ${result.country} [${result.asn}]`, status: 'Trapped' } : t
        ));
    } catch (e) {
        (window as any).showNotification('error', 'Trace Failed', 'Target is behind a darknet proxy.');
    } finally {
        setTracingId(null);
    }
  };

  const handleRetrain = async () => {
      if (isTraining) return;
      setIsTraining(true);
      setTrainingLogs([]);
      
      const addLog = (msg: string) => setTrainingLogs(prev => [...prev, msg]);
      
      addLog("Initializing backpropagation sequence...");
      await new Promise(r => setTimeout(r, 800));
      addLog("Ingesting 14,203 new events from local context...");
      await new Promise(r => setTimeout(r, 1200));
      addLog("Normalizing vectors [Matrix: 1024x1024]...");
      await new Promise(r => setTimeout(r, 1000));
      addLog("Optimizing weights (Epoch 1/3)... Loss: 0.042");
      await new Promise(r => setTimeout(r, 800));
      addLog("Optimizing weights (Epoch 3/3)... Loss: 0.011");
      await new Promise(r => setTimeout(r, 800));
      
      const res = await amunetApi.retrainModel();
      addLog(`Training Complete. Validation Accuracy: ${res.confidence}%`);
      
      setModelConfidence(res.confidence);
      setIsTraining(false);
      (window as any).showNotification('success', 'Model Updated', `Local weights updated. Confidence: ${res.confidence}%`);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-gray-800 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Eye className="text-sentinel-warning" />
                    Predictive Threat Engine
                </h2>
                <p className="text-gray-400 text-sm mt-1">Neural network monitoring global vectors 72h in advance.</p>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-500 font-mono mb-1">MODEL CONFIDENCE</div>
                <div className="text-3xl font-bold text-sentinel-warning font-mono">{modelConfidence}%</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart */}
            <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-white font-bold mb-4">Current Attack Vector Probabilities</h3>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar name="Threat Level" dataKey="A" stroke="#FFC107" strokeWidth={2} fill="#FFC107" fillOpacity={0.3} />
                        </RadarChart>
                    </ResponsiveContainer>
                    {/* Decorative scanning line */}
                    <div className="absolute inset-0 w-full h-1 bg-sentinel-warning/20 animate-scan pointer-events-none blur-sm"></div>
                </div>
            </div>

            {/* Predictions List */}
            <div className="lg:col-span-2 glass-panel p-0 rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-white font-bold">Imminent Threats Detected (Next 24h)</h3>
                    <button className="text-xs bg-sentinel-warning/10 text-sentinel-warning px-3 py-1 rounded border border-sentinel-warning/30 hover:bg-sentinel-warning/20">
                        Auto-Patch All
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
                    {threats.map((threat, i) => (
                        <motion.div 
                            key={threat.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-lg bg-[#0F1623] border border-gray-800 hover:border-sentinel-warning/50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sentinel-warning">
                                    {i === 0 ? <Zap size={20} /> : <AlertTriangle size={20} />}
                                </div>
                                <div>
                                    <div className="text-sm text-white font-bold flex items-center gap-2">
                                        {threat.type}
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-900/50">CRITICAL</span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                        Confidence: <span className="text-sentinel-warning">{threat.predictionConfidence}%</span> • Target: {threat.targetService}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs text-gray-400">Source</div>
                                    <div className="text-sm text-white font-mono">{threat.location}</div>
                                </div>
                                <button 
                                    onClick={() => handleTrace(threat.id, threat.sourceIp)}
                                    disabled={tracingId === threat.id}
                                    className={`p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-all ${tracingId === threat.id ? 'text-sentinel-accent bg-sentinel-accent/10' : ''}`}
                                    title="Trace Network Origin"
                                >
                                    {tracingId === threat.id ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        {/* Adaptive Neural Engine Section (New Feature) */}
        <div className="glass-panel rounded-xl overflow-hidden border-t-4 border-purple-500">
            <div className="p-6 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Brain className="text-purple-500" /> Adaptive Neural Engine
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        Amunet ships with a pre-trained global model, but learns from your unique traffic patterns.
                    </p>
                </div>
                <button 
                   onClick={handleRetrain}
                   disabled={isTraining}
                   className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCcw size={14} className={isTraining ? "animate-spin" : ""} />
                    {isTraining ? 'Training in Progress...' : 'Force Retraining Cycle'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                <div className="p-6">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                        <Database size={14} /> Global Knowledge
                    </div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold text-white">v2.5.0</span>
                        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50">STABLE</span>
                    </div>
                    <p className="text-xs text-gray-400">Pre-trained on 4PB of global attack vectors.</p>
                </div>
                
                <div className="p-6">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                        <GitBranch size={14} /> Local Context
                    </div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold text-white">{isTraining ? 'Updating...' : 'Active'}</span>
                        <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded border border-purple-900/50">LEARNING</span>
                    </div>
                    <p className="text-xs text-gray-400">14.2M local events analyzed. Weights adjusted continuously.</p>
                </div>

                <div className="p-6 bg-black/20">
                     <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                        <Terminal size={14} /> Training Log
                    </div>
                    <div className="font-mono text-[10px] h-20 overflow-y-auto custom-scrollbar space-y-1 text-gray-300">
                        {trainingLogs.length === 0 ? (
                            <div className="opacity-50 italic">System idle. Waiting for training trigger...</div>
                        ) : (
                            trainingLogs.map((log, i) => (
                                <div key={i} className="animate-in slide-in-from-left-2">
                                    <span className="text-purple-500 mr-2">{'>'}</span>{log}
                                </div>
                            ))
                        )}
                        {isTraining && <div className="animate-pulse text-purple-500">_</div>}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ThreatIntelligence;
