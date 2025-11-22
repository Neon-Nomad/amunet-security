

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDir?: 'up' | 'down';
  icon: React.ElementType;
  color?: 'accent' | 'danger' | 'warning' | 'success';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendDir, icon: Icon, color = 'accent' }) => {
  const colorClasses = {
    accent: 'text-amunet-accent bg-amunet-accent/10 border-amunet-accent/20',
    danger: 'text-amunet-danger bg-amunet-danger/10 border-amunet-danger/20',
    warning: 'text-amunet-warning bg-amunet-warning/10 border-amunet-warning/20',
    success: 'text-amunet-success bg-amunet-success/10 border-amunet-success/20',
  };

  return (
    <div className="glass-panel rounded-xl p-6 relative overflow-hidden group hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-mono font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]} transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-xs font-medium">
          <span className={`flex items-center ${trendDir === 'up' ? 'text-amunet-success' : 'text-amunet-danger'} mr-2`}>
            {trendDir === 'up' ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
            {trend}
          </span>
          <span className="text-gray-500">vs last hour</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;