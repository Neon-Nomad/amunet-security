

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Shuffle, 
  VenetianMask, 
  Activity, 
  Menu,
  X,
  Bell,
  Search,
  Cpu,
  Lock,
  Settings as SettingsIcon,
  Server,
  LogOut,
  TrendingUp,
  Book,
  Unlock,
  Globe,
  CloudLightning,
  FileCheck
} from 'lucide-react';
import DashboardOverview from './views/DashboardOverview';
import ThreatIntelligence from './views/ThreatIntelligence';
import MovingTargetDefense from './views/MovingTargetDefense';
import DeceptionNetwork from './views/DeceptionNetwork';
import ZeroTrust from './views/ZeroTrust';
import Settings from './views/Settings';
import Agents from './views/Agents';
import Analytics from './views/Analytics';
import Documentation from './views/Documentation';
import DecoyCloud from './views/DecoyCloud';
import Compliance from './views/Compliance';
import { Login } from './views/Login';
import { LandingPage } from './views/LandingPage';
import { DefenseMode } from './views/SentinelMode';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { amunetApi } from './services/AmunetAPI';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationSystem } from './components/NotificationSystem';
import { CommandPalette } from './components/CommandPalette';

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type View = 'dashboard' | 'threats' | 'mtd' | 'deception' | 'zerotrust' | 'settings' | 'agents' | 'analytics' | 'docs' | 'decoy' | 'compliance';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isBackendConnected, setIsBackendConnected] = useState(amunetApi.isUsingRealBackend());
  
  // View States
  const [showLogin, setShowLogin] = useState(false);

  // WOW FACTOR STATES
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isLockdown, setIsLockdown] = useState(false);
  const [isDefenseMode, setIsDefenseMode] = useState(false);

  // Subscribe to real-time events
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(() => {
      setIsBackendConnected(amunetApi.isUsingRealBackend());
    }, 2000);

    const unsubscribe = amunetApi.subscribeToRealTimeEvents((event) => {
      if (event.type === 'intrusion_detected') {
        setNotifications(prev => prev + 1);
      }
      if (event.type === 'lockdown_initiated') {
          setIsLockdown(true);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0B0F19] text-amunet-accent">Loading Amunet OS...</div>;
  }

  // Routing Logic: Landing -> Login -> Dashboard
  if (!isAuthenticated) {
      if (showLogin) {
          return <Login onBack={() => setShowLogin(false)} />;
      }
      return <LandingPage onLaunch={() => setShowLogin(true)} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={cn(
        "flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-all duration-200 group",
        currentView === view 
          ? "bg-amunet-accent/10 text-amunet-accent border-r-2 border-amunet-accent" 
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      )}
    >
      <Icon size={20} className={cn("mr-3 transition-colors", currentView === view ? "text-amunet-accent" : "group-hover:text-white")} />
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className={cn(
      "flex h-screen bg-amunet-bg text-gray-100 overflow-hidden font-sans transition-all duration-500",
      isLockdown && "grayscale-[0.5] contrast-125" 
    )}>
      <NotificationSystem />
      <CommandPalette 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        onLockdown={setIsLockdown}
        onSentinelMode={setIsDefenseMode}
      />

      {/* PERSISTENT DEMO WATERMARK */}
      {!isBackendConnected && (
        <div className="fixed bottom-4 right-4 z-[100] px-3 py-1.5 bg-yellow-900/30 border border-yellow-600/30 rounded-full text-[10px] text-yellow-500 font-mono font-bold pointer-events-none select-none backdrop-blur-sm flex items-center gap-2 animate-pulse">
           <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
           DEMO MODE - MOCK DATA
        </div>
      )}
      
      {/* DEFENSE MODE OVERLAY */}
      {isDefenseMode && <DefenseMode onClose={() => setIsDefenseMode(false)} />}

      {/* LOCKDOWN OVERLAY */}
      {isLockdown && (
        <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-amunet-danger/10 animate-pulse mix-blend-overlay"></div>
           <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amunet-danger/50 to-transparent"></div>
           <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-amunet-danger/50 to-transparent"></div>
           
           <div className="bg-amunet-danger text-black font-black px-12 py-4 text-4xl uppercase tracking-[0.5em] rotate-[-5deg] shadow-2xl border-y-8 border-black animate-pulse">
             Emergency Protocol Active
           </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1623] border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        isLockdown && "border-amunet-danger/50"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className={isLockdown ? "text-amunet-danger animate-pulse" : "text-amunet-accent"} size={28} />
            <span className="text-xl font-bold tracking-tighter text-white">
              AMUNET<span className={isLockdown ? "text-amunet-danger" : "text-amunet-accent"}>AI</span>
            </span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Core Modules</div>
          <nav className="px-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Command Center" />
            <NavItem view="threats" icon={Activity} label="Threat Prediction" />
            <NavItem view="mtd" icon={Shuffle} label="Morphing Defense" />
            <NavItem view="deception" icon={VenetianMask} label="Deception Layer" />
            <NavItem view="decoy" icon={CloudLightning} label="Decoy Cloud" />
            <NavItem view="zerotrust" icon={Lock} label="Zero Trust Access" />
          </nav>

          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4 mt-6">Governance</div>
          <nav className="px-2">
             <NavItem view="compliance" icon={FileCheck} label="Compliance & Audit" />
          </nav>

          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4 mt-6">Infrastructure</div>
          <nav className="px-2">
             <NavItem view="agents" icon={Server} label="Agents & Nodes" />
             <NavItem view="analytics" icon={TrendingUp} label="Analytics" />
             <NavItem view="settings" icon={SettingsIcon} label="Configuration" />
          </nav>

          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4 mt-6">Support</div>
          <nav className="px-2">
             <NavItem view="docs" icon={Book} label="Documentation" />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#0F1623]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amunet-accent to-blue-600 flex items-center justify-center text-xs font-bold text-black">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-white truncate">{user?.email}</div>
              <div className={`text-xs flex items-center ${isBackendConnected ? 'text-amunet-success' : 'text-amunet-warning'}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isBackendConnected ? 'bg-amunet-success animate-pulse' : 'bg-amunet-warning'}`}></span>
                {isBackendConnected ? 'Connected' : 'Simulation'}
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <LogOut size={14} className="mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className={cn(
          "h-16 backdrop-blur-md border-b flex items-center justify-between px-6 z-40 transition-colors",
          isLockdown ? "bg-amunet-danger/10 border-amunet-danger/30" : "bg-[#0B0F19]/90 border-gray-800"
        )}>
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-400">
            <Menu size={24} />
          </button>

          {/* Search/Cmd Bar */}
          <div 
            onClick={() => setIsCmdOpen(true)}
            className={cn(
              "hidden md:flex items-center max-w-md w-full border rounded-md px-3 py-1.5 transition-colors cursor-pointer",
              isLockdown 
                ? "bg-amunet-danger/10 border-amunet-danger/30 text-amunet-danger placeholder-red-400" 
                : "bg-gray-900/50 border-gray-700 text-gray-400 hover:border-amunet-accent/50 hover:text-gray-200"
            )}
          >
            <Search size={16} className="mr-2" />
            <div className="flex-1 text-sm opacity-70">
              {isLockdown ? "SYSTEM LOCKED. CMD+K FOR OVERRIDE" : "Search logs, IPs, or type command..."}
            </div>
            <div className="flex items-center space-x-1">
              <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] border border-gray-700">⌘K</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {isLockdown && (
               <button 
                 onClick={() => setIsLockdown(false)}
                 className="flex items-center gap-2 px-3 py-1 rounded-full bg-amunet-danger text-white text-xs font-bold animate-pulse hover:bg-red-600 transition-colors"
               >
                 <Unlock size={12} /> OVERRIDE
               </button>
            )}

            <button
              onClick={() => setIsDefenseMode(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all group"
            >
              <Globe size={14} className="text-blue-400 group-hover:animate-spin" />
              <span className="text-xs font-bold text-blue-400">Defense View</span>
            </button>

            <div className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full border ${isBackendConnected ? 'bg-amunet-accent/5 border-amunet-accent/20' : 'bg-yellow-900/10 border-yellow-600/20'}`}>
              <Cpu size={14} className={isBackendConnected ? "text-amunet-accent" : "text-yellow-600"} />
              <span className={`text-xs font-mono ${isBackendConnected ? "text-amunet-accent" : "text-yellow-600"}`}>
                {isBackendConnected ? 'Control Plane: Active' : 'DEMO MODE - Mock Data'}
              </span>
            </div>
            
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={20} className={isLockdown ? "text-amunet-danger" : ""} />
              {(notifications > 0 || isLockdown) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amunet-danger rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* View Area */}
        <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative">
           {/* Red Flash on Lockdown */}
           {isLockdown && <div className="absolute inset-0 bg-amunet-danger/5 pointer-events-none z-0"></div>}
           
           {/* Render Views */}
           <div className="p-6 min-h-full relative z-10">
             {currentView === 'dashboard' && <DashboardOverview onViewChange={setCurrentView} />}
             {currentView === 'threats' && <ThreatIntelligence />}
             {currentView === 'mtd' && <MovingTargetDefense />}
             {currentView === 'deception' && <DeceptionNetwork />}
             {currentView === 'decoy' && <DecoyCloud />}
             {currentView === 'compliance' && <Compliance />}
             {currentView === 'zerotrust' && <ZeroTrust />}
             {currentView === 'agents' && <Agents />}
             {currentView === 'analytics' && <Analytics />}
             {currentView === 'settings' && <Settings />}
             {currentView === 'docs' && <Documentation />}
           </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
