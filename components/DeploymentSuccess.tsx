
import React from 'react';
import { CheckCircle, ArrowRight, Activity, Settings, Server } from 'lucide-react';
import { CopyButton } from './CopyButton';

export const DeploymentSuccess: React.FC<{ agentId: string }> = ({ agentId }) => {
  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-sentinel-success/10 border border-sentinel-success/30 rounded-xl p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-sentinel-success/20 rounded-full">
                <CheckCircle className="w-12 h-12 text-sentinel-success" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Deployment Successful!</h2>
        <p className="text-gray-400 text-sm">
          Amunet Agent is now active and protecting <strong className="text-white">{agentId}</strong>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel rounded-lg p-4 border border-gray-800 text-center">
          <div className="text-gray-500 text-xs uppercase font-bold mb-1">Status</div>
          <div className="text-sentinel-success font-bold">Online</div>
        </div>
        <div className="glass-panel rounded-lg p-4 border border-gray-800 text-center">
          <div className="text-gray-500 text-xs uppercase font-bold mb-1">Heartbeat</div>
          <div className="text-white font-bold">2s ago</div>
        </div>
        <div className="glass-panel rounded-lg p-4 border border-gray-800 text-center">
          <div className="text-gray-500 text-xs uppercase font-bold mb-1">Next Rotation</div>
          <div className="text-white font-bold">4m 58s</div>
        </div>
      </div>

      {/* Notifications Integration */}
      <div className="glass-panel rounded-xl p-6 border border-gray-800">
          <h3 className="text-sm font-bold text-white mb-3">Enable Real-Time Alerts</h3>
          <p className="text-xs text-gray-400 mb-4">Get notified immediately when this agent rotates IPs or blocks a threat.</p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#4A154B] hover:bg-[#611f69] rounded-lg text-white text-xs font-bold transition-colors">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg" className="w-4 h-4" alt="Slack" />
                Connect Slack
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] rounded-lg text-white text-xs font-bold transition-colors">
                 <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/discordjs/discordjs-original.svg" className="w-4 h-4 bg-white rounded-full" alt="Discord" />
                Connect Discord
            </button>
          </div>
      </div>

      {/* Next Steps */}
      <div className="glass-panel rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Immediate Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded text-purple-400">
                <Activity size={20} />
              </div>
              <div className="text-left">
                <div className="text-white font-medium group-hover:text-sentinel-accent transition-colors">View Real-Time Activity</div>
                <div className="text-xs text-gray-500">Monitor IP rotations and threats</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                <Settings size={20} />
              </div>
              <div className="text-left">
                <div className="text-white font-medium group-hover:text-sentinel-accent transition-colors">Configure Policy</div>
                <div className="text-xs text-gray-500">Adjust rotation interval & honeypots</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sentinel-success/10 rounded text-sentinel-success">
                <Server size={20} />
              </div>
              <div className="text-left">
                <div className="text-white font-medium group-hover:text-sentinel-accent transition-colors">Deploy Another Agent</div>
                <div className="text-xs text-gray-500">Protect additional servers</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Credentials */}
      <div className="p-4 border border-dashed border-gray-700 rounded-lg bg-black/20 flex justify-between items-center">
        <div>
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Agent API Key (Save Securely)</div>
            <code className="font-mono text-sm text-sentinel-accent">sk_live_9928_x82_mnQ29s...</code>
        </div>
        <CopyButton text="sk_live_9928_x82_mnQ29s..." label="Copy Key" />
      </div>
    </div>
  );
};
