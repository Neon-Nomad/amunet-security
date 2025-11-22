
import React, { useEffect, useState } from 'react';
import { Shuffle, RefreshCcw, Shield, Server, Loader2, CheckCircle2, AlertCircle, Play, Pause, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { amunetApi } from '../services/AmunetAPI';
import { Agent } from '../types';

const MovingTargetDefense: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [rotationInterval, setRotationInterval] = useState(60);

  useEffect(() => {
    const load = async () => {
       const data = await amunetApi.getAgents();
       setAgents(data);
    };
    load();

    const unsubscribe = amunetApi.subscribeToRealTimeEvents((event) => {
      if (event.type === 'agent_update' || event.type === 'rotation_complete') {
         load();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleForceRotate = (id: string) => {
    amunetApi.forceRotation(id);
  };

  const togglePause = () => {
      setIsPaused(!isPaused);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shuffle className="text-sentinel-accent animate-pulse-fast" />
                Moving Target Defense (MTD)
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                Live visualization of your hybrid cloud infrastructure morphing. 
                Agents autonomously rotate IP addresses and port mappings to evade reconnaissance.
            </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
            
            {/* Controls */}
            <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 p-1">
                <button 
                    onClick={togglePause}
                    className={`p-2 rounded-md transition-colors ${isPaused ? 'text-sentinel-warning bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title={isPaused ? "Resume Global Rotation" : "Pause Global Rotation"}
                >
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
            </div>

            <div className="text-right bg-gray-900/50 p-4 rounded-lg border border-gray-700 min-w-[140px]">
                <div className="text-xs text-gray-500 font-mono mb-1">GLOBAL STATUS</div>
                <div className={`text-xl font-mono font-bold ${isPaused ? 'text-sentinel-warning' : 'text-sentinel-success'}`}>
                    {isPaused ? 'PAUSED' : 'MORPHING'}
                </div>
            </div>
        </div>
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 glass-panel p-6 rounded-xl min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Active Agent Topology</h3>
                <div className="flex items-center space-x-4 text-xs font-mono text-gray-500">
                    <span className="flex items-center"><div className="w-2 h-2 bg-sentinel-accent rounded-full mr-2"></div> ACTIVE</span>
                    <span className="flex items-center"><div className="w-2 h-2 bg-sentinel-warning rounded-full mr-2"></div> ROTATING</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                    {agents.map((agent) => (
                        <motion.div
                            key={agent.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1,
                                borderColor: agent.status === 'Rotating' ? '#FFC107' : 'rgba(55, 65, 81, 1)'
                            }}
                            className={`relative p-4 rounded-lg border bg-[#0F1623] border-gray-700 transition-all`}
                        >
                            {/* Morphing overlay effect */}
                            {agent.status === 'Rotating' && (
                                <div className="absolute inset-0 bg-sentinel-warning/5 z-10 rounded-lg ring-1 ring-sentinel-warning/50 animate-pulse"></div>
                            )}

                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded bg-blue-900/30 text-blue-400`}>
                                        <Server size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-white font-bold">{agent.hostname}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.provider} :: {agent.region}</div>
                                    </div>
                                </div>
                                
                                {/* Rotation Status Indicator */}
                                <div>
                                    {agent.status === 'Rotating' ? (
                                        <div className="flex items-center gap-1.5 text-sentinel-warning bg-sentinel-warning/10 px-2 py-1 rounded-full border border-sentinel-warning/20">
                                            <Loader2 size={10} className="animate-spin" />
                                            <span className="text-[10px] font-bold tracking-wider">ROTATING</span>
                                        </div>
                                    ) : (
                                        <button 
                                          onClick={() => handleForceRotate(agent.id)}
                                          className="text-gray-500 hover:text-white hover:bg-gray-700 p-1 rounded"
                                          title="Force Rotate"
                                        >
                                            <FastForward size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2 font-mono text-xs">
                                <div className="flex justify-between text-gray-400">
                                    <span>PUBLIC IP:</span>
                                    <span className="text-sentinel-accent transition-all duration-300">
                                        {agent.status === 'Rotating' ? <span className="blur-sm animate-pulse">ALLOCATING...</span> : agent.ip}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>PORTS:</span>
                                    <span className="text-white transition-all duration-300">
                                        {agent.activePorts.join(', ')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
         </div>

         {/* Stats / Config */}
         <div className="space-y-4">
             <div className="glass-panel p-6 rounded-xl">
                 <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                     <RefreshCcw size={16} /> Fleet Metrics
                 </h3>
                 <div className="space-y-6">
                     <div>
                         <div className="flex justify-between text-sm text-gray-400 mb-1">Agents Online</div>
                         <div className="text-2xl font-mono font-bold text-white">{agents.length}</div>
                     </div>
                     <div>
                         <div className="flex justify-between text-sm text-gray-400 mb-1">Total IP Rotations</div>
                         <div className="text-2xl font-mono font-bold text-white">14,203</div>
                     </div>
                     <div>
                         <div className="flex justify-between text-sm text-gray-400 mb-1">Attacker Recon Failures</div>
                         <div className="text-2xl font-mono font-bold text-sentinel-success">99.8%</div>
                     </div>
                 </div>
             </div>

             <div className="bg-sentinel-accent/5 border border-sentinel-accent/20 p-6 rounded-xl">
                 <h3 className="font-bold text-sentinel-accent mb-4 flex items-center gap-2">
                     <Shield size={16} /> Global Policy
                 </h3>
                 
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-gray-300">Default Rotation Interval</label>
                            <span className="text-xs font-mono text-sentinel-accent">{rotationInterval}s</span>
                        </div>
                        <input 
                            type="range" 
                            min="30" 
                            max="300" 
                            step="10"
                            value={rotationInterval} 
                            onChange={(e) => setRotationInterval(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sentinel-accent"
                        />
                    </div>
                    
                    <div className="p-3 bg-sentinel-warning/10 border border-sentinel-warning/20 rounded text-[10px] text-gray-400 leading-relaxed">
                        <strong className="text-sentinel-warning block mb-1">Optimization:</strong>
                        Agents will randomize this interval by ±15% to prevent timing attacks.
                    </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default MovingTargetDefense;
