




import React, { useEffect, useState } from 'react';
import { Server, Power, RefreshCw, Cloud, Terminal, CheckCircle2, AlertCircle, Copy, Cpu, Activity } from 'lucide-react';
import { amunetApi } from '../services/AmunetAPI';
import { Agent } from '../types';

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installCmd] = useState("curl -sSL https://install.amunet.ai | bash");

  useEffect(() => {
    loadAgents();
    const unsubscribe = amunetApi.subscribeToRealTimeEvents((event) => {
      if (event.type === 'agent_update' || event.type === 'rotation_complete') {
        loadAgents();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadAgents = async () => {
    const data = await amunetApi.getAgents();
    setAgents(data);
    setIsLoading(false);
  };

  const handleForceRotate = (id: string) => {
    amunetApi.forceRotation(id);
  };

  const copyInstallCmd = () => {
    navigator.clipboard.writeText(installCmd);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Server className="text-amunet-accent" />
            Infrastructure Agents
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Manage the Amunet Agents deployed across your hybrid cloud environment.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-700">
           <Terminal size={16} className="text-gray-400 ml-2" />
           <code className="text-xs text-gray-300 font-mono">{installCmd}</code>
           <button onClick={copyInstallCmd} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
             <Copy size={14} />
           </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-amunet-success rounded-full animate-pulse"></div>
             <span className="text-sm font-bold text-white">{agents.length} Agents Connected</span>
           </div>
           <button onClick={() => loadAgents()} className="text-gray-400 hover:text-white">
             <RefreshCw size={16} />
           </button>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading telemetry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0F1623] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Agent / Hostname</th>
                  <th className="p-4 font-medium">Provider & IP</th>
                  <th className="p-4 font-medium">Resource Usage</th>
                  <th className="p-4 font-medium">Health Check</th>
                  <th className="p-4 font-medium">Rotation Policy</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-800">
                {agents.map(agent => (
                  <tr key={agent.id} className="group hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded bg-gray-800 text-gray-300">
                           <Server size={18} />
                         </div>
                         <div>
                           <div className="font-bold text-white font-mono">{agent.hostname}</div>
                           <div className="text-xs text-gray-500">ID: {agent.id}</div>
                         </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white">
                        <Cloud size={14} className="text-amunet-accent" /> {agent.provider}
                      </div>
                      <div className="text-xs font-mono text-gray-500 mt-1">
                         {agent.status === 'Rotating' ? <span className="text-amunet-warning animate-pulse">Assigning new IP...</span> : agent.ip}
                      </div>
                      <div className="text-[10px] text-gray-600">{agent.region}</div>
                    </td>
                    <td className="p-4 min-w-[150px]">
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                                    <span className="flex items-center gap-1"><Cpu size={10} /> CPU</span>
                                    <span>{agent.cpuUsage}%</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{width: `${agent.cpuUsage}%`}}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                                    <span className="flex items-center gap-1"><Activity size={10} /> RAM</span>
                                    <span>{agent.memoryUsage}%</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{width: `${agent.memoryUsage}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                  agent.latency < 50 ? 'bg-amunet-success' : 
                                  agent.latency < 150 ? 'bg-amunet-warning' : 'bg-amunet-danger'
                              }`}></div>
                              <span className="text-white font-mono text-xs">{agent.latency}ms</span>
                          </div>
                          
                          {agent.status === 'Active' && (
                            <span className="text-[10px] text-amunet-success font-medium">Healthy</span>
                          )}
                          {agent.status === 'Rotating' && (
                            <span className="text-[10px] text-amunet-warning font-medium">Syncing...</span>
                          )}
                          {agent.status === 'Disconnected' && (
                            <span className="text-[10px] text-gray-500 font-medium">Unreachable</span>
                          )}
                       </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300">{agent.rotationInterval}s Interval</div>
                      <div className="text-xs text-gray-500">Next: {Math.floor(Math.random() * agent.rotationInterval)}s</div>
                    </td>
                    <td className="p-4 text-right">
                       <button 
                         onClick={() => handleForceRotate(agent.id)}
                         disabled={agent.status === 'Rotating'}
                         className="px-3 py-1.5 rounded hover:bg-amunet-accent/10 text-amunet-accent border border-transparent hover:border-amunet-accent/30 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         Force Rotate
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;