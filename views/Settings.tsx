

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Shield, Bell, Sliders, ToggleLeft, ToggleRight, Code, Terminal, Download, Link, Wifi, CreditCard, Check, ChevronRight, ArrowLeft, PlayCircle, Clock, BarChart2, HelpCircle, Brain, Key, Sparkles, Users, UserPlus, Trash2, Mail } from 'lucide-react';
import { amunetApi } from '../services/AmunetAPI';
import { useAuth } from '../contexts/AuthContext';
import { PreFlightChecks } from '../components/PreFlightChecks';
import { DeploymentProgress } from '../components/DeploymentProgress';
import { TroubleshootingAssistant } from '../components/TroubleshootingAssistant';
import { DeploymentSuccess } from '../components/DeploymentSuccess';
import { CopyButton } from '../components/CopyButton';
import { DeploymentHistory, DeploymentAttempt } from '../components/DeploymentHistory';
import { User } from '../types';

type DeploymentStep = 'select' | 'checks' | 'progress' | 'success' | 'error';
type DeploymentMethod = 'script' | 'k8s' | 'marketplace' | 'terraform';

const DEPLOYMENT_ESTIMATES = {
  script: { time: '30-60 min', difficulty: 'Intermediate', support: 'Email/Chat' },
  terraform: { time: '10-15 min', difficulty: 'Advanced', support: 'Slack/Email' },
  k8s: { time: '5-10 min', difficulty: 'Advanced', support: 'Slack/Email' },
  marketplace: { time: '2-3 min', difficulty: 'Beginner', support: 'Email' },
};

// Mock history
const MOCK_HISTORY: DeploymentAttempt[] = [
    { id: '1', timestamp: Date.now() - 86400000, status: 'success', method: 'AWS Marketplace', agentId: 'ag-prod-aws-04', duration: 145 },
    { id: '2', timestamp: Date.now() - 172800000, status: 'failed', method: 'Manual Script', error: 'IAM Permission Denied', duration: 320 },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'deployment' | 'connection' | 'team' | 'billing'>('general');
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('AMUNET_API_URL') || 'http://localhost:8000');
  const [wsUrl, setWsUrl] = useState(localStorage.getItem('AMUNET_WS_URL') || 'ws://localhost:8000/ws');
  const [isConnected, setIsConnected] = useState(amunetApi.isUsingRealBackend());
  const { user } = useAuth();
  
  // Deployment Wizard State
  const [deployStep, setDeployStep] = useState<DeploymentStep>('select');
  const [deployMethod, setDeployMethod] = useState<DeploymentMethod>('script');
  const [deployError, setDeployError] = useState<string>('');

  // AI Config State
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [isInviting, setIsInviting] = useState(false);

  const [config, setConfig] = useState({
    autoPatching: true,
    notifications: true,
    darkWebScanning: true,
    sensitivity: 'High',
    mtdMode: 'Aggressive',
    retentionDays: 30
  });

  useEffect(() => {
      if (activeTab === 'team') {
          loadTeam();
      }
  }, [activeTab]);

  const loadTeam = async () => {
      const users = await amunetApi.getUsers();
      setTeamMembers(users);
  };

  const handleInvite = async () => {
      if (!inviteEmail) return;
      setIsInviting(true);
      await amunetApi.inviteUser(inviteEmail, inviteRole);
      await loadTeam();
      setInviteEmail('');
      setIsInviting(false);
      (window as any).showNotification('success', 'Invitation Sent', `Invited ${inviteEmail} as ${inviteRole}.`);
  };

  const handleRemoveUser = async (userId: string) => {
      if (!window.confirm('Are you sure you want to remove this user?')) return;
      await amunetApi.removeUser(userId);
      setTeamMembers(prev => prev.filter(u => u.id !== userId));
      (window as any).showNotification('info', 'User Removed', 'Access revoked immediately.');
  };

  const handleToggle = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleSaveConnection = () => {
    amunetApi.setBackendUrl(apiUrl, wsUrl);
  };

  const handleVerifyKey = async () => {
    if (!apiKey) return;
    setIsVerifyingKey(true);
    try {
        await amunetApi.verifyAIConfig(aiProvider, apiKey);
        (window as any).showNotification('success', 'AI Connected', `Successfully authenticated with ${aiProvider.toUpperCase()}.`);
    } catch (e) {
        (window as any).showNotification('error', 'Connection Failed', 'Invalid API Key or rate limit exceeded.');
    } finally {
        setIsVerifyingKey(false);
    }
  };

  const handleCheckout = async (plan: string) => {
      (window as any).showNotification('info', 'Processing', 'Redirecting to payment provider...');
      try {
          const session = await amunetApi.createCheckoutSession(plan);
          if (session.url !== '#') {
             window.location.href = session.url;
          } else {
              setTimeout(() => {
                (window as any).showNotification('success', 'Payment Successful', 'Subscription updated in simulation mode.');
              }, 1500);
          }
      } catch (e) {
          (window as any).showNotification('error', 'Payment Failed', 'Could not initiate checkout.');
      }
  };

  const startDeployment = (method: DeploymentMethod) => {
      setDeployMethod(method);
      setDeployStep('checks');
  };

  const renderMethodCard = (method: DeploymentMethod, title: string, desc: string, icon: React.ReactNode, colorClass: string, codeSnippet?: string) => {
      const stats = DEPLOYMENT_ESTIMATES[method];
      
      return (
        <div className="glass-panel p-0 rounded-xl border border-gray-800 hover:border-gray-600 transition-all overflow-hidden group">
             <div className="p-6 cursor-pointer" onClick={() => startDeployment(method)}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg transition-colors ${colorClass}`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{title}</h3>
                            <p className="text-sm text-gray-400">{desc}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-600 group-hover:text-white" />
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="bg-black/30 rounded p-2 border border-gray-800/50">
                        <div className="text-gray-500 mb-0.5 flex items-center gap-1"><Clock size={10} /> Time</div>
                        <div className="text-white font-medium">{stats.time}</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 border border-gray-800/50">
                         <div className="text-gray-500 mb-0.5 flex items-center gap-1"><BarChart2 size={10} /> Difficulty</div>
                        <div className="text-white font-medium">{stats.difficulty}</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 border border-gray-800/50">
                         <div className="text-gray-500 mb-0.5 flex items-center gap-1"><HelpCircle size={10} /> Support</div>
                        <div className="text-white font-medium">{stats.support}</div>
                    </div>
                </div>
             </div>

             {/* Code Snippet Preview (if script) */}
             {codeSnippet && (
                 <div className="px-6 pb-6">
                    <div className="relative">
                        <div className="bg-[#0B0F19] border border-gray-800 rounded-lg p-3 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre pr-16">
                            {codeSnippet}
                        </div>
                        <div className="absolute top-2 right-2">
                            <CopyButton text={codeSnippet} />
                        </div>
                    </div>
                 </div>
             )}

             {/* Video Teaser Footer */}
             <div className="bg-gray-900/50 px-6 py-2 border-t border-gray-800 flex justify-between items-center">
                <button className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
                    <PlayCircle size={12} /> Watch Walkthrough
                </button>
                <span className="text-[10px] text-gray-500">Updated 2 days ago</span>
             </div>
        </div>
      );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-gray-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="text-gray-400" />
            System Configuration
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Manage global policies, deployment artifacts, and AI behavior.
          </p>
        </div>
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700 overflow-x-auto max-w-full">
           {['general', 'deployment', 'connection', 'team', 'billing'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6">
          
          {/* Generative AI Provider Section */}
          <div className="glass-panel p-6 rounded-xl border-l-4 border-purple-500">
            <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
                 <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Sparkles size={18} className="text-purple-500" />
                        Generative Intelligence Provider
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        Configure the LLM used for "Inner Voice", Playbook generation, and natural language CLI.
                    </p>
                 </div>
                 <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-400 font-bold uppercase">
                     BYOK Enabled
                 </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Model Provider</label>
                        <select 
                            value={aiProvider}
                            onChange={(e) => setAiProvider(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-purple-500 outline-none"
                        >
                            <option value="gemini">Google Gemini 1.5 Pro (Recommended)</option>
                            <option value="openai">OpenAI GPT-4 Turbo</option>
                            <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                            <option value="amunet">Amunet Cloud (Managed - Enterprise Only)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">API Key</label>
                        <div className="relative">
                            <input 
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-purple-500 outline-none pl-9"
                            />
                            <Key size={14} className="absolute left-3 top-3 text-gray-500" />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-2">
                    <button 
                        onClick={handleVerifyKey}
                        disabled={!apiKey || isVerifyingKey}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isVerifyingKey ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={14} />}
                        Verify & Connect
                    </button>
                </div>
            </div>
          </div>

          {/* AI & Automation Section */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Shield size={18} className="text-sentinel-accent" />
              Automated Response Policies
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Autonomous Patching</div>
                  <div className="text-xs text-gray-500">Allow Amunet to auto-deploy fixes for critical CVEs.</div>
                </div>
                <button onClick={() => handleToggle('autoPatching')} className="text-sentinel-accent">
                  {config.autoPatching ? <ToggleRight size={32} className="text-sentinel-accent" /> : <ToggleLeft size={32} className="text-gray-600" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Dark Web Monitoring</div>
                  <div className="text-xs text-gray-500">Scan marketplaces for leaked credentials.</div>
                </div>
                <button onClick={() => handleToggle('darkWebScanning')} className="text-sentinel-accent">
                  {config.darkWebScanning ? <ToggleRight size={32} className="text-sentinel-accent" /> : <ToggleLeft size={32} className="text-gray-600" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                 <div>
                  <div className="text-sm font-medium text-white">Threat Confidence Threshold</div>
                  <div className="text-xs text-gray-500">Minimum confidence score (0-100) before taking action.</div>
                </div>
                <select 
                  value={config.sensitivity}
                  onChange={(e) => setConfig({...config, sensitivity: e.target.value})}
                  className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-sentinel-accent focus:border-sentinel-accent block p-2.5"
                >
                  <option value="Low">Low (Minimize False Positives)</option>
                  <option value="Medium">Medium (Balanced)</option>
                  <option value="High">High (Paranoid)</option>
                </select>
              </div>
            </div>
          </div>

          {/* MTD & Network Section */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Sliders size={18} className="text-sentinel-warning" />
              Network Defense Policies
            </h3>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div>
                  <div className="text-sm font-medium text-white">MTD Morphing Strategy</div>
                  <div className="text-xs text-gray-500">Algorithm used for IP/Port rotation.</div>
                </div>
                <select 
                  value={config.mtdMode}
                  onChange={(e) => setConfig({...config, mtdMode: e.target.value})}
                  className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-sentinel-accent focus:border-sentinel-accent block p-2.5"
                >
                  <option value="Standard">Standard (Predictable Interval)</option>
                  <option value="Aggressive">Aggressive (Random Walk)</option>
                  <option value="Reactive">Reactive (Triggered by Threat)</option>
                </select>
              </div>

               <div className="flex items-center justify-between">
                 <div>
                  <div className="text-sm font-medium text-white">Log Retention Policy</div>
                  <div className="text-xs text-gray-500">Duration to store forensic data.</div>
                </div>
                <select 
                  value={config.retentionDays}
                  onChange={(e) => setConfig({...config, retentionDays: parseInt(e.target.value)})}
                  className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-sentinel-accent focus:border-sentinel-accent block p-2.5"
                >
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>1 Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deployment' && (
        <div className="space-y-6">
           {/* Wizard Header (if not selecting) */}
           {deployStep !== 'select' && (
               <button 
                 onClick={() => setDeployStep('select')} 
                 className="flex items-center text-xs text-gray-400 hover:text-white mb-4"
               >
                   <ArrowLeft size={14} className="mr-1" /> Back to Deployment Options
               </button>
           )}

           {/* STEP 1: METHOD SELECTION */}
           {deployStep === 'select' && (
               <>
                <div className="grid grid-cols-1 gap-6">
                    {renderMethodCard(
                        'script', 
                        'Manual Script Installation', 
                        'Universal bash script for Linux servers (AWS, GCP, Azure, On-Prem).',
                        <Terminal size={24} />,
                        'bg-gray-800 text-white group-hover:bg-sentinel-accent group-hover:text-black',
                        'curl -sSL https://install.amunet.ai | sudo bash'
                    )}
                    
                    {renderMethodCard(
                        'k8s', 
                        'Kubernetes DaemonSet', 
                        'Deploy agents automatically to every node in your cluster.',
                        <Code size={24} />,
                        'bg-gray-800 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'
                    )}

                    {renderMethodCard(
                        'marketplace', 
                        'AWS Marketplace AMI', 
                        'Launch pre-configured instances with Amunet Agent baked in.',
                        <Shield size={24} />,
                        'bg-gray-800 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black'
                    )}
                </div>
                
                {/* History Log */}
                <DeploymentHistory attempts={MOCK_HISTORY} />
               </>
           )}

           {/* STEP 2: PRE-FLIGHT CHECKS */}
           {deployStep === 'checks' && (
               <PreFlightChecks onComplete={(success) => {
                   if (success) {
                       setDeployStep('progress');
                   } else {
                       setDeployError('Prerequisites failed. Please resolve issues above.');
                       setDeployStep('error');
                   }
               }} />
           )}

           {/* STEP 3: INSTALLATION PROGRESS */}
           {deployStep === 'progress' && (
               <DeploymentProgress 
                 onComplete={() => setDeployStep('success')} 
                 onError={() => {
                     setDeployError('Connection timed out while awaiting heartbeat.');
                     setDeployStep('error');
                 }} 
               />
           )}

           {/* STEP 4: SUCCESS */}
           {deployStep === 'success' && (
               <DeploymentSuccess agentId={`ag-${Math.floor(Math.random()*10000)}`} />
           )}

           {/* ERROR STATE */}
           {deployStep === 'error' && (
               <div className="space-y-6">
                   <TroubleshootingAssistant error={deployError} />
                   <button 
                     onClick={() => setDeployStep('select')}
                     className="w-full py-3 border border-gray-700 hover:bg-gray-800 rounded-lg text-gray-300 transition-colors"
                   >
                       Restart Deployment
                   </button>
               </div>
           )}
        </div>
      )}

      {activeTab === 'connection' && (
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
            <Link size={18} className="text-sentinel-accent" />
            Control Plane Connection
          </h3>
          
          <div className="space-y-6">
             <div className={`p-4 rounded-lg border ${isConnected ? 'bg-sentinel-success/10 border-sentinel-success/30' : 'bg-sentinel-warning/10 border-sentinel-warning/30'}`}>
               <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-sentinel-success' : 'bg-sentinel-warning'}`}></div>
                  <div>
                    <div className={`font-bold ${isConnected ? 'text-sentinel-success' : 'text-sentinel-warning'}`}>
                      {isConnected ? 'Connected to Control Plane' : 'Running in Simulation Mode'}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {isConnected 
                        ? 'Telemetry is streaming live from your active agents.' 
                        : 'We could not reach your backend. The dashboard is using simulated data for demonstration.'}
                    </p>
                  </div>
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-white mb-2">Backend API URL</label>
               <input 
                 type="text" 
                 value={apiUrl}
                 onChange={(e) => setApiUrl(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 focus:border-sentinel-accent focus:outline-none font-mono text-sm"
                 placeholder="http://localhost:8000"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-white mb-2">WebSocket URL</label>
               <input 
                 type="text" 
                 value={wsUrl}
                 onChange={(e) => setWsUrl(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 focus:border-sentinel-accent focus:outline-none font-mono text-sm"
                 placeholder="ws://localhost:8000/ws"
               />
             </div>

             <div className="pt-4 flex justify-end">
               <button 
                 onClick={handleSaveConnection}
                 className="px-6 py-2 bg-sentinel-accent hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
               >
                 <Wifi size={18} />
                 Save & Connect
               </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
         <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Users size={18} className="text-sentinel-accent" />
                            Team Management
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Manage access control and RBAC roles for your organization.</p>
                    </div>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 mb-6 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                        <div className="relative">
                             <Mail className="absolute left-3 top-2.5 text-gray-500" size={14} />
                             <input 
                                type="email" 
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="w-full bg-black border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:border-sentinel-accent outline-none"
                             />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role</label>
                        <select 
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sentinel-accent outline-none"
                        >
                            <option value="admin">Admin</option>
                            <option value="analyst">Analyst</option>
                            <option value="auditor">Auditor</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleInvite}
                        disabled={isInviting || !inviteEmail}
                        className="w-full md:w-auto px-4 py-2 bg-sentinel-accent hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <UserPlus size={16} />
                        {isInviting ? 'Sending...' : 'Invite'}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-800">
                            {teamMembers.map(member => (
                                <tr key={member.id} className="group hover:bg-gray-900/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-700">
                                                {member.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-white font-medium">{member.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            member.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            member.role === 'auditor' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-gray-800 text-gray-400 border border-gray-700'
                                        }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sentinel-success text-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sentinel-success"></div>
                                            Active
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {member.id !== user?.id && (
                                            <button 
                                                onClick={() => handleRemoveUser(member.id)}
                                                className="p-2 hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded transition-colors"
                                                title="Remove User"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
         </div>
      )}

      {activeTab === 'billing' && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Plan */}
            <div className="md:col-span-3 glass-panel p-6 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Current Subscription</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        {user?.plan ? user.plan.toUpperCase() : 'STARTUP'} PLAN
                        <span className="text-xs bg-sentinel-success/10 text-sentinel-success px-2 py-1 rounded border border-sentinel-success/30">ACTIVE</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Next billing date: Nov 01, 2024</div>
                </div>
                <CreditCard className="text-gray-600 w-12 h-12" />
            </div>

            {/* Pricing Cards */}
            <div className="glass-panel p-6 rounded-xl border border-gray-700 flex flex-col">
                <h3 className="text-xl font-bold text-white">Startup</h3>
                <div className="text-3xl font-bold text-sentinel-accent mt-2">$499<span className="text-sm text-gray-500 font-normal">/mo</span></div>
                <ul className="mt-6 space-y-3 flex-1 text-sm text-gray-300">
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> 50 Nodes</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> 30 Days Retention</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> Basic Support</li>
                </ul>
                <button 
                    onClick={() => handleCheckout('startup')}
                    className="mt-6 w-full py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors text-sm"
                >
                    Current Plan
                </button>
            </div>

            <div className="glass-panel p-6 rounded-xl border-2 border-sentinel-accent relative flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sentinel-accent text-black text-[10px] font-bold px-3 py-0.5 rounded-full uppercase">Recommended</div>
                <h3 className="text-xl font-bold text-white">Growth</h3>
                <div className="text-3xl font-bold text-sentinel-accent mt-2">$1,999<span className="text-sm text-gray-500 font-normal">/mo</span></div>
                <ul className="mt-6 space-y-3 flex-1 text-sm text-gray-300">
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> 500 Nodes</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> 90 Days Retention</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> Priority Support</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> Advanced MTD</li>
                </ul>
                <button 
                    onClick={() => handleCheckout('growth')}
                    className="mt-6 w-full py-2 rounded-lg bg-sentinel-accent hover:bg-cyan-400 text-black font-bold transition-colors text-sm"
                >
                    Upgrade
                </button>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-gray-700 flex flex-col">
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <div className="text-3xl font-bold text-sentinel-accent mt-2">Custom</div>
                <ul className="mt-6 space-y-3 flex-1 text-sm text-gray-300">
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> Unlimited Nodes</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> 1 Year Retention</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> 24/7 Dedicated Support</li>
                    <li className="flex gap-2"><Check size={16} className="text-sentinel-success" /> Custom Integrations</li>
                </ul>
                <button 
                    onClick={() => handleCheckout('enterprise')}
                    className="mt-6 w-full py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors text-sm"
                >
                    Contact Sales
                </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default Settings;
