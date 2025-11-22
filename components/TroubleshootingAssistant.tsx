
import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, MessageSquare, HelpCircle, RefreshCcw, BookOpen } from 'lucide-react';
import { amunetApi } from '../services/AmunetAPI';

interface Issue {
  id: string;
  error: string;
  solutions: string[];
  docLink?: string;
}

const COMMON_ISSUES: Issue[] = [
  {
    id: 'ip-alloc',
    error: 'Failed to allocate Elastic IP',
    solutions: [
      'Check if you have available Elastic IPs in your AWS account (limit is usually 5)',
      'Verify IAM permissions include "ec2:AllocateAddress"',
      'Check AWS service limits for your specific region',
    ],
    docLink: 'https://docs.amunet.ai/troubleshooting/ip-allocation'
  },
  {
    id: 'conn-refused',
    error: 'Connection refused to control plane',
    solutions: [
      'Verify your API key is correct in /etc/amunet/config.yaml',
      'Check if port 443 is open for outbound traffic in Security Groups',
      'Ensure your corporate firewall allows WebSocket (WSS) connections',
      'Test connectivity: curl -I https://api.amunet.ai',
    ],
    docLink: 'https://docs.amunet.ai/troubleshooting/connectivity'
  },
  {
    id: 'perm-denied',
    error: 'Permission denied when running agent',
    solutions: [
      'Agent requires root privileges to modify iptables rules',
      'Run installation with sudo',
      'Ensure SELinux is not blocking the amunet-agent binary',
    ],
    docLink: 'https://docs.amunet.ai/installation/permissions'
  },
];

export const TroubleshootingAssistant: React.FC<{ error?: string }> = ({ error }) => {
  const [isRollingBack, setIsRollingBack] = useState(false);

  const findMatchingIssue = (errorMsg: string) => {
    return COMMON_ISSUES.find(issue => 
      errorMsg.toLowerCase().includes(issue.error.toLowerCase())
    ) || COMMON_ISSUES[1]; 
  };

  const matchedIssue = error ? findMatchingIssue(error) : COMMON_ISSUES[1];

  const handleRollback = async () => {
    setIsRollingBack(true);
    try {
        await amunetApi.rollbackDeployment("pending-agent");
        (window as any).showNotification(
            'success',
            'Rollback Complete',
            'All resources have been cleaned up. You can try again.'
        );
    } catch (e) {
        (window as any).showNotification('error', 'Rollback Failed', 'Could not auto-clean resources.');
    } finally {
        setIsRollingBack(false);
    }
  };

  return (
    <div className="bg-sentinel-warning/5 border border-sentinel-warning/30 rounded-xl p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-sentinel-warning/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-sentinel-warning" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            Deployment Interrupted
          </h3>
          <p className="text-gray-400 text-sm">
              We encountered an error during the installation process. Based on the logs, here is how to fix it.
          </p>
        </div>
      </div>

      {matchedIssue && (
        <div className="space-y-6">
          <div className="bg-black/40 p-4 rounded border border-gray-800">
             <div className="text-xs text-gray-500 mb-1 uppercase font-bold">Detected Error</div>
             <div className="font-mono text-sm text-sentinel-danger">{error || "Connection timed out after 30000ms"}</div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <HelpCircle size={16} /> Suggested Solutions
            </h4>
            <ul className="space-y-3">
              {matchedIssue.solutions.map((solution, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sentinel-accent flex-shrink-0"></div>
                    {solution}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800">
            <button 
              onClick={handleRollback}
              disabled={isRollingBack}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-sentinel-danger hover:bg-red-600 rounded-lg text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
               <RefreshCcw className={`w-4 h-4 ${isRollingBack ? 'animate-spin' : ''}`} />
               {isRollingBack ? 'Cleaning Resources...' : 'Rollback & Clean Up'}
            </button>

            <div className="flex gap-3 sm:ml-auto">
                {/* Updated button to look like internal link suggestion, though kept as external/action for now */}
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-xs font-medium transition-colors"
                  onClick={() => (window as any).location.href = '#'} 
                >
                    <BookOpen className="w-4 h-4" />
                    View Docs
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-sentinel-accent hover:bg-cyan-400 rounded-lg text-black text-xs font-bold transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Support
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
