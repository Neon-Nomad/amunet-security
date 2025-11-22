
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { amunetApi } from '../services/AmunetAPI';
import { AnalyticsData } from '../types';
import { TrendingUp, Shield, Activity, Calendar } from 'lucide-react';

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        const analytics = await amunetApi.getAnalytics();
        setData(analytics);
        setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading || !data) return <div className="p-8 text-center text-gray-500">Loading analytics data...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="text-sentinel-accent" />
          Performance Analytics
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Historical analysis of Moving Target Defense efficiency and threat mitigation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rotation Efficiency Chart */}
        <div className="glass-panel p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity className="text-sentinel-success" size={18} />
                    MTD Rotations (30 Days)
                </h3>
                <select className="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-1 text-gray-400">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                </select>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.rotations}>
                        <defs>
                            <linearGradient id="colorRotations" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#05D5FA" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#05D5FA" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#05D5FA" strokeWidth={2} fillOpacity={1} fill="url(#colorRotations)" name="IP Rotations" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Threat Mitigation Chart */}
        <div className="glass-panel p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Shield className="text-sentinel-danger" size={18} />
                    Threats Blocked
                </h3>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.threats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: '#1f2937'}}
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Bar dataKey="value" fill="#FF2A6D" radius={[4, 4, 0, 0]} name="Attacks Blocked" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Rotations</div>
              <div className="text-2xl font-mono font-bold text-white">
                  {data.rotations.reduce((a, b) => a + b.value, 0).toLocaleString()}
              </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Threats</div>
              <div className="text-2xl font-mono font-bold text-white">
                  {data.threats.reduce((a, b) => a + b.value, 0).toLocaleString()}
              </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Avg Uptime</div>
              <div className="text-2xl font-mono font-bold text-sentinel-success">
                  99.98%
              </div>
          </div>
      </div>
    </div>
  );
};

export default Analytics;
