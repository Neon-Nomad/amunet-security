

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Zap, Globe, AlertTriangle, Shuffle, VenetianMask } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import StatCard from '../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MOCK_LOGS } from '../constants';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
    onViewChange: (view: any) => void;
}

const DashboardOverview: React.FC<DashboardProps> = ({ onViewChange }) => {
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [logs, setLogs] = useState(MOCK_LOGS);

  // Generate mock chart data
  useEffect(() => {
    const data = Array.from({ length: 20 }).map((_, i) => ({
      time: `${i}:00`,
      legitimate: Math.floor(Math.random() * 500) + 1000,
      attacks: Math.floor(Math.random() * 100) + 20,
    }));
    setTrafficData(data);

    const interval = setInterval(() => {
      setTrafficData(prev => {
        const newData = [...prev.slice(1), {
          time: 'Now',
          legitimate: Math.floor(Math.random() * 500) + 1000,
          attacks: Math.floor(Math.random() * 150) + 20,
        }];
        return newData;
      });
      
      // Update logs randomly
      if (Math.random() > 0.6) {
          setLogs(prev => {
             const newLog = { time: new Date().toLocaleTimeString('en-GB'), msg: `Automated: Blocked suspicious packet from 192.168.0.${Math.floor(Math.random() * 255)}` };
             return [newLog, ...prev.slice(0, 4)];
          });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Security Score" 
          value="98.4%" 
          trend="1.2%" 
          trendDir="up" 
          icon={ShieldCheck} 
          color="success"
        />
        <StatCard 
          title="Threats Predicted" 
          value="1,204" 
          trend="12%" 
          trendDir="up" 
          icon={Activity} 
          color="accent"
        />
        <StatCard 
          title="Attacks Trapped" 
          value="432" 
          trend="5%" 
          trendDir="up" 
          icon={Zap} 
          color="warning"
        />
        <StatCard 
          title="Global Active Nodes" 
          value="86" 
          icon={Globe} 
          color="accent"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Traffic Analysis */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">AI Real-Time Traffic Analysis</h3>
              <p className="text-sm text-gray-400">Separating legitimate requests from autonomous attacks</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center text-amunet-accent"><div className="w-3 h-3 bg-amunet-accent rounded-full mr-1"></div> Valid</span>
              <span className="flex items-center text-amunet-danger"><div className="w-3 h-3 bg-amunet-danger rounded-full mr-1"></div> Attack</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorValid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2A6D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF2A6D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="legitimate" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorValid)" />
                <Area type="monotone" dataKey="attacks" stroke="#FF2A6D" strokeWidth={2} fillOpacity={1} fill="url(#colorAttack)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Activity Log */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Live Operations Log</h3>
          <div className="flex-1 overflow-hidden relative">
             {/* Gradient fade for old logs */}
             <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#111827]/80 to-transparent z-10 pointer-events-none"></div>
             <div className="space-y-4 font-mono text-xs overflow-y-auto h-full pr-2">
               {logs.map((log, i) => (
                 <div key={i} className="flex space-x-3 animate-in fade-in slide-in-from-left-2 duration-300">
                   <span className="text-gray-500 shrink-0">{log.time}</span>
                   <span className={cn(
                     "break-words",
                     log.msg.includes("Blocked") ? "text-amunet-danger" :
                     log.msg.includes("Prediction") ? "text-amunet-warning" :
                     log.msg.includes("MTD") ? "text-amunet-accent" : "text-gray-300"
                   )}>
                     <span className="mr-2 opacity-50">{">"}</span>
                     {log.msg}
                   </span>
                 </div>
               ))}
             </div>
          </div>
          <button className="mt-4 w-full py-2 border border-gray-700 hover:bg-gray-800 rounded text-xs text-gray-400 transition-colors">
            View Full Audit Trail
          </button>
        </div>
      </div>
      
      {/* Lower Section: Modules Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div 
            className="glass-panel p-6 rounded-xl border-t-4 border-amunet-warning cursor-pointer hover:bg-gray-800/50 transition-all"
            onClick={() => onViewChange('threats')}
         >
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">Threat Prediction</h4>
                <Activity className="text-amunet-warning" size={18} />
            </div>
            <p className="text-xs text-gray-400 mb-4">AI confidence level at 98%. 3 potential zero-day vectors analyzed in the last hour.</p>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-amunet-warning h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-mono">
                <span>PROCESSING</span>
                <span>QUEUE: 12ms</span>
            </div>
         </div>

         <div 
            className="glass-panel p-6 rounded-xl border-t-4 border-amunet-accent cursor-pointer hover:bg-gray-800/50 transition-all"
            onClick={() => onViewChange('mtd')}
         >
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">Morphing Defense</h4>
                <Shuffle className="text-amunet-accent" size={18} />
            </div>
            <p className="text-xs text-gray-400 mb-4">Infrastructure rotated 45 times today. Next full topology shift in 12s.</p>
            <div className="flex space-x-1">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 5 ? 'bg-gray-700' : 'bg-amunet-accent animate-pulse'}`} style={{ animationDelay: `${i * 0.2}s`}}></div>
                ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-mono">
                <span>STATUS: ACTIVE</span>
                <span>IP ROTATION: ON</span>
            </div>
         </div>

         <div 
            className="glass-panel p-6 rounded-xl border-t-4 border-amunet-danger cursor-pointer hover:bg-gray-800/50 transition-all"
            onClick={() => onViewChange('deception')}
         >
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">Deception Grid</h4>
                <VenetianMask className="text-amunet-danger" size={18} />
            </div>
            <p className="text-xs text-gray-400 mb-4">12 Active honeypots deployed. 4 intruders currently isolated in sandbox.</p>
            <div className="grid grid-cols-6 gap-1">
                {Array.from({length: 12}).map((_, i) => (
                    <div key={i} className={`h-3 w-3 rounded-sm ${i < 4 ? 'bg-amunet-danger animate-pulse' : 'bg-gray-700'}`}></div>
                ))}
            </div>
             <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-mono">
                <span>ISOLATION</span>
                <span>INTEL: COLLECTING</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DashboardOverview;