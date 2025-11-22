
import React, { useState, useEffect } from 'react';
import { VenetianMask, Bug, Terminal, MapPin, FileText, Search, Skull, Brain, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { amunetApi } from '../services/AmunetAPI';

const DeceptionNetwork: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const trappedAttackers = [
    { id: 1, ip: '103.4.22.19', region: 'Shanghai, CN', technique: 'SSH Brute Force', duration: '14m 22s', status: 'Isolated' },
    { id: 2, ip: '45.12.99.201', region: 'Kyiv, UA', technique: 'SQL Injection', duration: '02m 10s', status: 'Deceiving' },
    { id: 3, ip: '185.200.11.4', region: 'Lagos, NG', technique: 'RCE Attempt', duration: '00m 45s', status: 'Deceiving' },
    { id: 4, ip: 'Tor Exit Node', region: 'Unknown', technique: 'Port Scanning', duration: '22m 01s', status: 'Isolated' },
  ];

  useEffect(() => {
    const fetchLogs = async () => {
        const data = await amunetApi.getHoneypotLogs();
        setLogs(data);
    };
    fetchLogs();
  }, []);

  const toggleLog = (id: string) => {
      if (expandedLog === id) {
          setExpandedLog(null);
      } else {
          setExpandedLog(id);
      }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <VenetianMask className="text-sentinel-danger" />
            Intelligent Deception Layer
        </h2>
        <p className="text-gray-400 text-sm mt-2">
            95% of the infrastructure exposed to the public is fake. 
            We trap attackers in high-fidelity honeypots to waste their time and gather TTPs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Grid Visualizer */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sentinel-danger/50 to-transparent opacity-50"></div>
            
            <h3 className="text-white font-bold mb-6 flex justify-between">
                <span>Live Deception Grid</span>
                <span className="text-xs font-mono text-sentinel-danger animate-pulse">● 4 Active Engagements</span>
            </h3>

            {/* Hexagon Grid Simulation (CSS Grid) */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {Array.from({ length: 48 }).map((_, i) => {
                    const isTrapped = [5, 12, 33, 41].includes(i);
                    const isDecoy = i % 3 === 0;
                    
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className={`aspect-square rounded-md border flex items-center justify-center relative group cursor-crosshair
                                ${isTrapped 
                                    ? 'bg-sentinel-danger/20 border-sentinel-danger shadow-[0_0_15px_rgba(255,42,109,0.3)]' 
                                    : 'bg-gray-800/30 border-gray-800 hover:border-gray-600'}
                            `}
                        >
                            {isTrapped ? (
                                <Bug size={20} className="text-sentinel-danger animate-pulse" />
                            ) : (
                                <div className={`w-1.5 h-1.5 rounded-full ${isDecoy ? 'bg-gray-600' : 'bg-gray-800'}`}></div>
                            )}
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-gray-700 text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                {isTrapped ? 'ATTACKER ISOLATED' : `Node ${i} [Decoy]`}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            <div className="mt-8 p-4 bg-black/40 rounded border border-gray-800 font-mono text-xs text-green-400 h-32 overflow-hidden">
                <div className="opacity-50 mb-2 border-b border-gray-700 pb-1">Honeypot Interaction Logs</div>
                <div className="space-y-1">
                   <p>> [HP-Alpha] Connection accepted from 103.4.22.19</p>
                   <p>> [HP-Alpha] Serving fake /etc/passwd file...</p>
                   <p>> [HP-Beta] SQL Injection signature detected. Expanding latency.</p>
                   <p>> [HP-Gamma] Fake admin credentials used: 'admin:password123'</p>
                   <p className="text-sentinel-danger">> [System] Attacker fingerprinting complete. Profile ID: #9921A</p>
                </div>
            </div>
        </div>

        {/* Right: Trapped List */}
        <div className="space-y-4">
            {trappedAttackers.map((attacker) => (
                <motion.div 
                    key={attacker.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="glass-panel p-4 rounded-xl border-l-4 border-sentinel-danger group hover:bg-gray-800/80 transition-colors"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Terminal size={16} className="text-gray-400" />
                            <span className="font-mono font-bold text-white text-sm">{attacker.ip}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sentinel-danger/20 text-sentinel-danger border border-sentinel-danger/30 animate-pulse">
                            {attacker.status.toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin size={12} />
                            {attacker.region}
                        </div>
                        <div className="text-xs bg-black/30 p-2 rounded text-gray-300">
                            <span className="text-gray-500">Vector:</span> {attacker.technique}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2">
                            <span>TIME WASTED:</span>
                            <span className="text-white">{attacker.duration}</span>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-800 flex gap-2">
                        <button className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors">
                            Trace
                        </button>
                        <button className="flex-1 py-1.5 bg-sentinel-danger/20 hover:bg-sentinel-danger/30 text-sentinel-danger rounded text-xs transition-colors">
                            Ban Subnet
                        </button>
                    </div>
                </motion.div>
            ))}
            
            <div className="p-4 border border-dashed border-gray-700 rounded-xl text-center text-gray-500 text-xs hover:border-gray-500 transition-colors cursor-pointer">
                View Historical Forensic Data
            </div>
        </div>
      </div>

      {/* HONEYPOT THEATER SECTION */}
      <div className="mt-12">
         <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-sentinel-accent" /> Honeypot Theater <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 ml-2 font-normal">Live Interceptor Stream</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1">Real captured payloads. AI forensically analyzes intent in real-time.</p>
            </div>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 hover:text-white">Export CSV</button>
            </div>
         </div>

         <div className="glass-panel rounded-xl overflow-hidden">
             <div className="grid grid-cols-12 bg-gray-900/80 border-b border-gray-800 p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-2">Source IP</div>
                <div className="col-span-1">Service</div>
                <div className="col-span-5">Captured Payload</div>
                <div className="col-span-2 text-right">Analysis</div>
             </div>
             
             <div className="divide-y divide-gray-800">
                 {logs.map((log) => (
                     <div key={log.id} className="bg-[#0B0F19] hover:bg-gray-900/30 transition-colors">
                         <div 
                            className="grid grid-cols-12 p-4 items-center text-sm cursor-pointer"
                            onClick={() => toggleLog(log.id)}
                         >
                             <div className="col-span-2 text-gray-400 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                             <div className="col-span-2 text-white font-mono">{log.sourceIp} <span className="text-gray-600 text-xs">({log.country})</span></div>
                             <div className="col-span-1"><span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{log.service}</span></div>
                             <div className="col-span-5 font-mono text-xs text-red-400 truncate pr-4">{log.payload}</div>
                             <div className="col-span-2 text-right flex justify-end items-center gap-2 text-sentinel-accent text-xs font-bold">
                                 AI Analysis {expandedLog === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                             </div>
                         </div>
                         
                         <AnimatePresence>
                             {expandedLog === log.id && (
                                 <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-gray-900/50 border-t border-gray-800"
                                 >
                                     <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <div>
                                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                 <Skull size={14} /> Raw Payload Capture
                                             </h4>
                                             <div className="bg-black p-3 rounded border border-gray-800 font-mono text-xs text-red-400 break-all">
                                                 {log.payload}
                                             </div>
                                         </div>
                                         <div>
                                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                 <Brain size={14} /> AI Intent Analysis
                                             </h4>
                                             <div className="space-y-2">
                                                 <div className="flex justify-between text-sm text-white">
                                                     <span>Attack Type:</span>
                                                     <span className="font-bold text-sentinel-warning">{log.intent}</span>
                                                 </div>
                                                 <div className="flex justify-between text-sm text-white">
                                                     <span>Risk Score:</span>
                                                     <span className="font-bold text-sentinel-danger">CRITICAL (98/100)</span>
                                                 </div>
                                                 <div className="p-2 bg-sentinel-accent/10 border border-sentinel-accent/20 rounded text-xs text-sentinel-accent mt-2">
                                                     Recommendation: Attacker has been fingerprinted. Auto-generating firewall rule for ASN block.
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </motion.div>
                             )}
                         </AnimatePresence>
                     </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};

export default DeceptionNetwork;
