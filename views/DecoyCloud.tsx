

import React, { useEffect, useState } from 'react';
import { CloudLightning, Ghost, Shield, Plus, Trash2, Activity, DollarSign, Server, Database, Globe, AlertOctagon, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { amunetApi } from '../services/AmunetAPI';
import { DecoyCluster } from '../types';
import StatCard from '../components/StatCard';

const DecoyCloud: React.FC = () => {
  const [decoys, setDecoys] = useState<DecoyCluster[]>([]);
  const [ghostMode, setGhostMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deploymentType, setDeploymentType] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await amunetApi.getDecoyClusters();
      setDecoys(data);
    };
    load();

    // Real-time effect simulation
    const interval = setInterval(() => {
        setDecoys(prev => prev.map(d => {
            if (d.status === 'Under Attack' || d.status === 'Compromised') {
                return { 
                    ...d, 
                    costToAttacker: d.costToAttacker + Math.floor(Math.random() * 50),
                    attacksDiverted: d.attacksDiverted + Math.floor(Math.random() * 5)
                };
            }
            return d;
        }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleDeploy = async (type: string) => {
    setDeploymentType(type);
    setLoading(true);
    
    try {
        await amunetApi.deployDecoy(type);
        const newCluster: DecoyCluster = {
            id: `dc-${Date.now()}`,
            name: `Shadow-${type.replace(/\s/g, '-')}`,
            type: type as any,
            status: 'Active',
            attacksDiverted: 0,
            resourceUsage: 2,
            uptime: '0m',
            costToAttacker: 0
        };
        setDecoys(prev => [...prev, newCluster]);
        (window as any).showNotification('success', 'Decoy Deployed', `${type} cluster is now active and listening.`);
    } finally {
        setLoading(false);
        setDeploymentType(null);
    }
  };

  const handlePurge = async () => {
      if (!window.confirm('Are you sure you want to flush compromised decoys? This will reset active trap contexts.')) return;
      const res = await amunetApi.purgeDecoys();
      setDecoys(prev => prev.filter(d => d.status !== 'Compromised'));
      (window as any).showNotification('info', 'Decoys Flushed', `Cleaned up ${res.purged} clusters.`);
  };

  const totalDiverted = decoys.reduce((acc, curr) => acc + curr.attacksDiverted, 0);
  const totalCost = decoys.reduce((acc, curr) => acc + curr.costToAttacker, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <CloudLightning className="text-sentinel-accent" />
                Decoy Cloud
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                Parallel infrastructure that mirrors production to trap sophisticated attackers. 
                Zero production impact. 100% engagement monitoring.
            </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                ghostMode ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-gray-900 border-gray-700 text-gray-400'
            }`} onClick={() => setGhostMode(!ghostMode)}>
                <Ghost size={18} className={ghostMode ? "animate-pulse" : ""} />
                <div className="text-xs font-bold uppercase tracking-wider">
                    Ghost Mode: {ghostMode ? 'ENABLED' : 'OFF'}
                </div>
            </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <StatCard 
            title="Attacks Diverted to Decoys" 
            value={totalDiverted.toLocaleString()} 
            icon={Shield} 
            trend="92%" 
            trendDir="up"
            color="success" 
         />
         <StatCard 
            title="Est. Attacker Cost Wasted" 
            value={`$${totalCost.toLocaleString()}`} 
            icon={DollarSign} 
            trend="+$450/hr" 
            trendDir="up"
            color="accent" 
         />
         <StatCard 
            title="Production Load Impact" 
            value="0.04%" 
            icon={Activity} 
            color="warning" 
         />
      </div>

      {/* Infrastructure Mirror Visualizer */}
      <div className="glass-panel p-0 rounded-xl overflow-hidden border border-gray-800 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1 rounded-b-lg text-[10px] font-mono text-gray-500 z-10 border border-gray-700 border-t-0">
              INFRASTRUCTURE_MIRROR // VIRTUALIZATION_LAYER
          </div>
          
          <div className="grid grid-cols-2 min-h-[300px] divide-x divide-gray-800">
              
              {/* Real Infrastructure (Safe) */}
              <div className="p-8 relative bg-[#0B0F19]">
                  <div className="absolute top-4 left-4 text-xs font-bold text-green-500 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      REALITY (PRODUCTION)
                  </div>
                  
                  <div className="h-full flex flex-col items-center justify-center gap-8 opacity-100 transition-opacity duration-500" style={{ opacity: ghostMode ? 0.2 : 1 }}>
                      <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                          <Globe size={32} />
                      </div>
                      <div className="w-0.5 h-12 bg-gradient-to-b from-green-500/30 to-transparent"></div>
                      <div className="flex gap-8">
                          <div className="p-3 rounded border border-gray-700 bg-gray-900 text-gray-400"><Database size={20} /></div>
                          <div className="p-3 rounded border border-gray-700 bg-gray-900 text-gray-400"><Server size={20} /></div>
                          <div className="p-3 rounded border border-gray-700 bg-gray-900 text-gray-400"><Server size={20} /></div>
                      </div>
                  </div>
                  
                  {ghostMode && (
                      <div className="absolute inset-0 flex items-center justify-center text-purple-500 font-mono text-sm tracking-widest font-bold">
                          <Ghost size={48} className="mb-4 animate-bounce" />
                          <span className="absolute mt-20">INVISIBLE TO SCANNERS</span>
                      </div>
                  )}
              </div>

              {/* Decoy Infrastructure (Chaos) */}
              <div className="p-8 relative bg-gradient-to-br from-[#0B0F19] to-red-900/10 overflow-hidden">
                  <div className="absolute top-4 right-4 text-xs font-bold text-red-500 flex items-center gap-2">
                      DECOY (SIMULATION)
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  </div>

                  {/* Background Noise */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                  
                  {/* Attack Arcs */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path d="M 0 150 Q 150 50 300 150" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_1s_linear_infinite]">
                        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />
                      </path>
                      <path d="M 0 180 Q 120 250 350 120" fill="none" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.5" className="animate-[dash_1.5s_linear_infinite]">
                         <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />
                      </path>
                  </svg>

                  <div className="h-full flex flex-col items-center justify-center gap-8">
                       <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                          <Globe size={32} />
                      </div>
                      <div className="w-0.5 h-12 bg-gradient-to-b from-red-500/50 to-transparent"></div>
                      <div className="flex gap-8">
                          {decoys.map((d, i) => (
                              <div key={d.id} className="relative group">
                                  <div className={`p-3 rounded border ${d.status === 'Compromised' ? 'border-red-500 bg-red-900/20 text-red-400' : 'border-orange-500/50 bg-orange-900/10 text-orange-400'}`}>
                                      {d.type === 'Database' ? <Database size={20} /> : <Server size={20} />}
                                  </div>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black border border-gray-700 p-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                      <div className="font-bold text-white">{d.name}</div>
                                      <div className="text-gray-400">{d.status}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Decoy Clusters List */}
      <div className="glass-panel rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Active Decoy Clusters</h3>
              <div className="flex gap-2">
                  <button 
                    onClick={handlePurge}
                    className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold text-red-400 hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-900/50"
                  >
                      <Trash2 size={14} /> Flush Compromised
                  </button>
                  <div className="relative group">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-sentinel-accent text-black hover:bg-cyan-400 transition-colors">
                          <Plus size={14} /> Deploy New Decoy
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#0B0F19] border border-gray-700 rounded shadow-xl overflow-hidden hidden group-hover:block z-20">
                          {['Database', 'Web Server', 'Auth Service', 'Kubernetes Cluster'].map(type => (
                              <button 
                                key={type}
                                onClick={() => handleDeploy(type)}
                                disabled={loading}
                                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                              >
                                  {loading && deploymentType === type ? 'Deploying...' : type}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {decoys.map(decoy => (
                  <div key={decoy.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-start justify-between group hover:border-gray-600 transition-colors">
                      <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                              decoy.status === 'Compromised' ? 'bg-red-500/10 text-red-500' :
                              decoy.status === 'Under Attack' ? 'bg-orange-500/10 text-orange-500' :
                              'bg-blue-500/10 text-blue-500'
                          }`}>
                              {decoy.type === 'Database' ? <Database size={20} /> : 
                               decoy.type === 'Kubernetes Cluster' ? <CloudLightning size={20} /> : <Server size={20} />}
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                  {decoy.name}
                                  {decoy.status === 'Compromised' && <AlertOctagon size={12} className="text-red-500 animate-pulse" />}
                              </h4>
                              <div className="text-xs text-gray-500 font-mono mt-1">
                                  ID: {decoy.id} • Uptime: {decoy.uptime}
                              </div>
                              <div className="flex gap-4 mt-3 text-[10px] text-gray-400">
                                  <div>
                                      <span className="block text-gray-600 uppercase font-bold">Diverted</span>
                                      <span className="text-white font-mono">{decoy.attacksDiverted.toLocaleString()}</span>
                                  </div>
                                  <div>
                                      <span className="block text-gray-600 uppercase font-bold">Wasted Cost</span>
                                      <span className="text-sentinel-accent font-mono">${decoy.costToAttacker.toLocaleString()}</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="text-right">
                          <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider inline-block mb-2 ${
                              decoy.status === 'Compromised' ? 'bg-red-500/20 text-red-400' :
                              decoy.status === 'Under Attack' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-green-500/20 text-green-400'
                          }`}>
                              {decoy.status}
                          </div>
                          <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white ml-auto">
                              <Terminal size={10} /> View Shell Trap
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default DecoyCloud;