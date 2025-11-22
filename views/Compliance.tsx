

import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, History, Download, CheckCircle, AlertTriangle, FileCheck, Search, Filter, PlayCircle, Eye, Activity, X } from 'lucide-react';
import { amunetApi } from '../services/AmunetAPI';
import { AuditLog, ComplianceControl, Policy } from '../types';
import StatCard from '../components/StatCard';
import { motion, AnimatePresence } from 'framer-motion';

const Compliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'policies'>('dashboard');
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [c, l, p] = await Promise.all([
        amunetApi.getComplianceControls(),
        amunetApi.getAuditLogs(),
        amunetApi.getPolicies()
      ]);
      setControls(c);
      setLogs(l);
      setPolicies(p);
    };
    loadData();
  }, []);

  // Poll for log updates to show the dynamic nature of the system
  useEffect(() => {
      if (activeTab === 'logs') {
          const interval = setInterval(async () => {
              const l = await amunetApi.getAuditLogs();
              setLogs(l);
          }, 2000);
          return () => clearInterval(interval);
      }
  }, [activeTab]);

  const handleExport = async () => {
      setIsGenerating(true);
      await amunetApi.exportAuditPackage('SOC2');
      setIsGenerating(false);
      (window as any).showNotification('success', 'Audit Package Ready', 'Evidence collection downloaded securely.');
  };

  const handleTestControl = async (id: string) => {
      (window as any).showNotification('info', 'Running Test', 'Validating control logic against live infrastructure...');
      await amunetApi.runComplianceTest(id);
      (window as any).showNotification('success', 'Control Passed', 'Validation successful.');
  };

  const handleAckPolicy = async (id: string) => {
      await amunetApi.acknowledgePolicy(id, 'current-user');
      setPolicies(prev => prev.map(p => p.id === id ? { ...p, acknowledged: true } : p));
      (window as any).showNotification('success', 'Policy Acknowledged', 'Compliance record updated.');
  };

  return (
    <div className="space-y-6 relative">
        <div className="border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileCheck className="text-sentinel-accent" />
                    SOC 2 Compliance Center
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                    Continuous audit monitoring, evidence collection, and policy management.
                </p>
            </div>
            <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
                {['dashboard', 'logs', 'policies'].map((tab) => (
                    <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                    {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Security (CC6)" 
                        value="12/12" 
                        icon={ShieldCheck} 
                        color="success"
                        trend="Passing" 
                        trendDir="up"
                    />
                    <StatCard 
                        title="Availability (A1)" 
                        value="8/10" 
                        icon={Activity} 
                        color="warning"
                        trend="2 Warnings" 
                        trendDir="down"
                    />
                    <StatCard 
                        title="Confidentiality (C1)" 
                        value="6/6" 
                        icon={FileText} 
                        color="success"
                        trend="Passing" 
                        trendDir="up"
                    />
                </div>

                <div className="glass-panel rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white">Control Status Board (TSC)</h3>
                        <button 
                            onClick={handleExport}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-sentinel-accent hover:bg-cyan-400 text-black font-bold rounded-lg text-xs transition-all disabled:opacity-50"
                        >
                            <Download size={14} />
                            {isGenerating ? 'Generating...' : 'Export Evidence Package'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {controls.map(control => (
                            <div key={control.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-gray-700 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-sentinel-accent font-bold bg-black px-2 py-0.5 rounded text-xs">{control.code}</span>
                                        <h4 className="text-white font-bold text-sm">{control.name}</h4>
                                        {control.status === 'Pass' && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900/50">PASS</span>}
                                        {control.status === 'Warning' && <span className="text-[10px] bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded border border-yellow-900/50">WARNING</span>}
                                        {control.status === 'Fail' && <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-900/50">FAIL</span>}
                                    </div>
                                    <p className="text-xs text-gray-400">{control.description}</p>
                                </div>
                                
                                <div className="flex items-center gap-4 md:w-auto w-full justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Evidence</div>
                                        <div className="text-white font-mono text-sm">{control.evidenceCount} items</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Last Check</div>
                                        <div className="text-white font-mono text-sm">2m ago</div>
                                    </div>
                                    <button 
                                        onClick={() => handleTestControl(control.id)}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors" title="Run Manual Test"
                                    >
                                        <PlayCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}

        {/* AUDIT LOGS VIEW */}
        {activeTab === 'logs' && (
            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <History size={18} /> Immutable Audit Trail
                    </h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search action, actor, or resource..."
                                className="w-full bg-black border border-gray-700 rounded pl-9 pr-3 py-1.5 text-xs text-white focus:border-sentinel-accent outline-none"
                            />
                        </div>
                        <button className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded border border-gray-700 text-xs font-bold flex items-center gap-2 hover:text-white">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B0F19] text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Actor</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Resource</th>
                                <th className="p-4">Integrity Check</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-gray-800">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-900/30 transition-colors group animate-in fade-in slide-in-from-top-2">
                                    <td className="p-4 text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="text-white font-bold">{log.actor.email}</div>
                                        <div className="text-gray-500">{log.actor.role} • {log.actor.ip}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded border ${log.status === 'success' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300 font-mono">{log.resource}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <CheckCircle size={12} />
                                            <span className="font-mono text-[10px] opacity-50">{log.hash.substring(0, 12)}...</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* POLICIES VIEW */}
        {activeTab === 'policies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {policies.map(policy => (
                     <div key={policy.id} className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col justify-between">
                         <div>
                             <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-gray-800 rounded-lg">
                                     <FileText className="text-white" size={24} />
                                 </div>
                                 {policy.acknowledged ? (
                                     <span className="flex items-center gap-1 text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50 font-bold uppercase">
                                         <CheckCircle size={10} /> Acknowledged
                                     </span>
                                 ) : (
                                     <span className="flex items-center gap-1 text-[10px] bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded border border-yellow-900/50 font-bold uppercase">
                                         <AlertTriangle size={10} /> Review Required
                                     </span>
                                 )}
                             </div>
                             <h3 className="text-lg font-bold text-white mb-1">{policy.title}</h3>
                             <div className="flex gap-3 text-xs text-gray-500 mb-6">
                                 <span>Version: {policy.version}</span>
                                 <span>Updated: {policy.lastUpdated}</span>
                             </div>
                         </div>
                         
                         <div className="flex gap-3">
                             <button 
                                onClick={() => setSelectedPolicy(policy)}
                                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2"
                            >
                                 <Eye size={14} /> Read
                             </button>
                             {!policy.acknowledged && (
                                 <button 
                                    onClick={() => handleAckPolicy(policy.id)}
                                    className="flex-1 py-2 bg-sentinel-accent hover:bg-cyan-400 text-black text-xs font-bold rounded transition-colors"
                                >
                                     Acknowledge
                                 </button>
                             )}
                         </div>
                     </div>
                 ))}
            </div>
        )}

        {/* POLICY READER MODAL */}
        <AnimatePresence>
            {selectedPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl glass-panel rounded-xl overflow-hidden flex flex-col max-h-[80vh] border border-gray-700 shadow-2xl"
                    >
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedPolicy.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                    <span>v{selectedPolicy.version}</span>
                                    <span>•</span>
                                    <span>Effective: {selectedPolicy.lastUpdated}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedPolicy(null)}
                                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto prose prose-invert prose-sm max-w-none">
                            {selectedPolicy.content ? (
                                <div dangerouslySetInnerHTML={{ __html: selectedPolicy.content }} />
                            ) : (
                                <div className="text-gray-500 italic">No content available for this policy.</div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedPolicy(null)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded"
                            >
                                Close
                            </button>
                            {!selectedPolicy.acknowledged && (
                                <button 
                                    onClick={() => {
                                        handleAckPolicy(selectedPolicy.id);
                                        setSelectedPolicy(null);
                                    }}
                                    className="px-4 py-2 bg-sentinel-accent hover:bg-cyan-400 text-black text-xs font-bold rounded"
                                >
                                    I Acknowledge & Agree
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Compliance;