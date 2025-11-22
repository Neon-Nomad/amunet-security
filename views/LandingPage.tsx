


import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, Zap, Lock, ChevronRight, Activity, Globe, Cpu, 
  ArrowRight, CheckCircle, PlayCircle, Command, Server, Terminal, Cloud,
  Shuffle, Layers, FastForward, Eye, FileText, Database, Code
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

// --- HERO TERMINAL COMPONENT ---
const HeroTerminalDemo = () => {
  const [lines, setLines] = useState<string[]>([
    "> initializing defense protocols...",
  ]);

  useEffect(() => {
    const sequence = [
      { text: "> detecting threat signature: CVE-2024-9921", delay: 800, color: "text-amunet-warning" },
      { text: "> source: 192.168.4.22 (Unknown Proxy)", delay: 1600, color: "text-gray-400" },
      { text: "> initiating MTD rotation sequence...", delay: 2400, color: "text-amunet-accent" },
      { text: "> migrating workloads to safe zone...", delay: 3200, color: "text-amunet-accent" },
      { text: "> target surface shifted. attacker lost.", delay: 4000, color: "text-amunet-success" },
      { text: "> system secure. standing by.", delay: 4800, color: "text-gray-500" },
    ];

    let timeouts: any[] = [];

    sequence.forEach(({ text, delay, color }) => {
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, `<span class="${color}">${text}</span>`]);
      }, delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-[#0B0F19] rounded-lg border border-gray-800 overflow-hidden shadow-2xl font-mono text-xs sm:text-sm relative group hover:border-gray-600 transition-colors">
      <div className="bg-[#111827] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
        <div className="text-gray-500 text-[10px]">AMUNET_GUARD // CLOUD_PROTECTOR</div>
      </div>
      <div className="p-6 min-h-[320px] flex flex-col relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        <div className="space-y-2 relative z-10 flex-1">
          {lines.map((line, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
          <div className="flex items-center gap-2">
             <span className="text-amunet-accent">➜</span>
             <span className="animate-pulse bg-gray-600 w-2 h-4 block"></span>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800/50 grid grid-cols-2 gap-4">
            <div>
                <div className="text-amunet-success font-bold mb-1">Threat Neutralized</div>
                <div className="text-[10px] text-gray-500">IP 192.168.1.5 rotated to 10.0.4.2</div>
            </div>
            <div>
                <div className="text-amunet-warning font-bold mb-1">Port Hopping</div>
                <div className="text-[10px] text-gray-500">SSH Port shifted: 22 {'->'} 29411</div>
            </div>
        </div>
      </div>
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-amunet-accent/20 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="bg-[#0F1623] py-1 px-4 text-center border-t border-gray-800">
         <span className="text-[10px] text-gray-500 uppercase tracking-widest">Live simulation. No agent required.</span>
      </div>
    </div>
  );
};

// --- DEV CLI TERMINAL COMPONENT ---
const DevCliTerminal = () => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-700 opacity-90 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 p-2 border-b border-gray-800 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-auto text-[10px] text-gray-500 font-mono">AMUNETAI // CINEMATIC CLI</div>
        </div>
        <div className="bg-black p-6 font-mono text-sm text-gray-300 h-[360px] overflow-y-hidden leading-relaxed">
            <div>{'>'} scan</div>
            <div className="text-amunet-success">✓ System Scan Complete</div>
            <div className="pl-4 text-gray-500">• 0 critical threats</div>
            <div className="pl-4 text-gray-500">• 2 low-severity anomalies (auto-mitigated)</div>
            
            <div className="mt-4">{'>'} rotate --all</div>
            <div className="text-blue-400">i Rotating 527 agents across 3 regions...</div>
            <div className="text-blue-400">i Verifying new IP reachability...</div>
            <div className="text-amunet-success">✓ Done (1.2s)</div>

            <div className="mt-4">{'>'} lockdown</div>
            <div className="text-amunet-warning">⚠ Initiating emergency isolation protocol...</div>
            <div className="text-amunet-success">✓ All external access sealed</div>
            <div className="text-amunet-success">✓ Honeypots elevated to front-line</div>
            <div className="text-gray-500">✓ Team notified via Slack + Email</div>

            <div className="mt-4">{'>'} scan target:db-1</div>
            <div className="text-blue-400">i Deep heuristic scan for zero-day artifacts...</div>
            <div className="text-amunet-success">✓ No malicious patterns detected</div>
            
            <div className="mt-4">{'>'} <span className="animate-pulse">_</span></div>
        </div>
        <div className="bg-gray-900 px-4 py-2 text-[10px] text-gray-500 text-center border-t border-gray-800">
            Full keyboard control. Aliases, history, chaining, macros—and natural language.
        </div>
    </div>
  );
}

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; desc: string; delay: number }> = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="p-6 rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-amunet-accent/30 transition-all hover:bg-gray-900/60 group cursor-default h-full"
  >
    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-gray-700 group-hover:border-amunet-accent/50">
      <Icon className="text-amunet-accent group-hover:text-white transition-colors" size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCli = () => {
    const element = document.getElementById('cli');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden font-sans selection:bg-amunet-accent/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#0B0F19]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-amunet-accent" fill="currentColor" fillOpacity={0.2} />
            <span className="font-bold text-xl tracking-tight">AMUNET<span className="text-amunet-accent">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-white transition-colors cursor-pointer">Capabilities</a>
            <a href="#cloud" onClick={(e) => scrollToSection(e, 'cloud')} className="hover:text-white transition-colors cursor-pointer">Integrations</a>
            <a href="#cli" onClick={(e) => scrollToSection(e, 'cli')} className="hover:text-white transition-colors cursor-pointer">Developer CLI</a>
          </div>
          <button 
            onClick={onLaunch}
            className="px-5 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            Login <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amunet-accent/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amunet-accent/10 border border-amunet-accent/20 text-amunet-accent text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={12} fill="currentColor" />
              Autonomous Cloud Defense v2.5
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              The Last Firewall <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amunet-accent to-purple-500">
                You'll Ever Need.
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
              Stop chasing alerts. Start confusing attackers. Amunet uses 
              <span className="text-white font-semibold"> Moving Target Defense (MTD) </span> 
              to make your cloud infrastructure practically impossible to target at scale.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onLaunch}
                className="px-8 py-4 bg-amunet-accent hover:bg-cyan-400 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)]"
              >
                Deploy Protection
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
              <button 
                onClick={scrollToCli}
                className="px-8 py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle size={18} />
                See It In Action
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> 5-Min Setup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> Multi-Cloud
              </div>
              <div className="flex items-center gap-2 opacity-75">
                <CheckCircle size={16} className="text-gray-500" /> Zero Trust Ready
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <HeroTerminalDemo />
          </motion.div>
        </div>
      </header>

      {/* Cloud Protection Section */}
      <section id="cloud" className="border-y border-white/5 bg-white/[0.02] py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Seamless Integration with your Cloud Stack</h3>
            <p className="text-sm text-gray-500 font-medium mb-8 uppercase tracking-widest">
                Amunet’s lightweight agents run wherever your workloads live.
            </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70">
            <div className="flex items-center gap-3 text-xl font-bold text-gray-300 hover:text-white hover:opacity-100 transition-all cursor-default">
                <Cloud className="text-[#FF9900]" /> AWS
            </div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-300 hover:text-white hover:opacity-100 transition-all cursor-default">
                <Cloud className="text-[#4285F4]" /> Google Cloud
            </div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-300 hover:text-white hover:opacity-100 transition-all cursor-default">
                <Cloud className="text-[#0078D4]" /> Azure
            </div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-300 hover:text-white hover:opacity-100 transition-all cursor-default">
                <Server className="text-gray-400" /> On-Prem / Bare Metal
            </div>
          </div>
        </div>
      </section>

      {/* "Defense that moves" Section */}
      <section id="features" className="py-24 px-6 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Defense that moves faster than the attack.</h2>
            <p className="text-gray-400 text-lg">
              Traditional security builds static walls. Amunet turns your infrastructure into a moving target—chaotic for attackers, stable for your users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <FeatureCard 
              icon={Shuffle}
              title="Moving Target Defense"
              desc="Automatically rotates IP addresses, ports, and OS fingerprints every 60 seconds to evade reconnaissance and frustrate automated scanners."
              delay={0.1}
            />
            <FeatureCard 
              icon={Globe}
              title="Deception Grid"
              desc="Deploys hundreds of high-fidelity honeypots that mimic your real services, trapping attackers while your production stays untouched."
              delay={0.2}
            />
            <FeatureCard 
              icon={Cpu}
              title="Predictive AI Core"
              desc="Neural models analyze global threat vectors in real-time and correlate them with your stack to preemptively harden exposed surfaces."
              delay={0.3}
            />
          </div>
          
          {/* Advanced Capabilities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Command}
              title="Cinematic CLI"
              desc="Control your entire security posture through a hacker-style command palette. Type scan, rotate, or lockdown and Amunet executes instantly."
              delay={0.4}
            />
            <FeatureCard 
              icon={Lock}
              title="Zero Trust Enforcement"
              desc="Every request is authenticated, authorized, and encrypted. Risk scores are calculated in real time per session, with dynamic policy decisions."
              delay={0.5}
            />
            <FeatureCard 
              icon={Server}
              title="Hybrid Cloud Agent"
              desc="A lightweight Go binary runs across AWS, GCP, Azure, and on-prem servers, coordinating IP rotation, deception, and telemetry."
              delay={0.6}
            />
            <FeatureCard 
              icon={FastForward}
              title="Command Automation"
              desc="Record your incident response once as a macro, then replay it in 2 seconds: scan, rotate, snapshot, alert team—no human lag."
              delay={0.7}
            />
            <FeatureCard 
              icon={Activity}
              title="Real-Time Intelligence"
              desc="watch streams live threats, grep searches millions of events, and benchmark scores your defensive posture—all from the same console."
              delay={0.8}
            />
            <FeatureCard 
              icon={FileText}
              title="Audit-Ready Logging"
              desc="Every action, rotation, and lockdown is logged immutably for compliance, forensics, and post-incident review."
              delay={0.9}
            />
          </div>
        </div>
      </section>

      {/* CLI Teaser Section */}
      <section id="cli" className="py-24 px-6 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden border-y border-gray-800 scroll-mt-20">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-5"></div>
         
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <Terminal size={12} />
                    Developer Experience
                </div>
                <h2 className="text-4xl font-bold mb-6">Security at the speed of thought.</h2>
                <p className="text-gray-400 text-lg mb-8">
                    Forget clicking through endless dashboards. Amunet’s Command Palette (⌘K) gives you god-mode control over your infrastructure.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="font-mono text-amunet-accent bg-black px-2 py-1 rounded text-sm whitespace-nowrap">{'>'} scan</div>
                        <div className="text-sm text-gray-400">Instant system-wide threat scan.</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="font-mono text-amunet-danger bg-black px-2 py-1 rounded text-sm whitespace-nowrap">{'>'} lockdown</div>
                        <div className="text-sm text-gray-400">Emergency isolation protocol in ~2s.</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="font-mono text-blue-400 bg-black px-2 py-1 rounded text-sm whitespace-nowrap">{'>'} rotate --all</div>
                        <div className="text-sm text-gray-400">Shift IP surface for entire fleet.</div>
                    </div>
                </div>
            </div>
            <div className="relative">
                {/* Stylized Keyboard Hint */}
                <div className="absolute -top-10 -right-10 opacity-20 pointer-events-none">
                     <div className="text-[120px] font-bold font-mono text-white">⌘K</div>
                </div>
                <DevCliTerminal />
            </div>
         </div>
      </section>
      
      {/* Trust Section */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Built for high-velocity security teams.</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
                Whether you’re a one-person security team or running a global SOC, Amunet gives you automation, visibility, and control without the enterprise bloat.
            </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amunet-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to secure the future?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Deploy your first agent in under 5 minutes. Turn your cloud from a static target into a living, adaptive defense system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
                onClick={onLaunch}
                className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
            >
                Start Free Trial
            </button>
            <a 
                href="mailto:hello@amunet.ai"
                className="px-8 py-4 bg-transparent border border-gray-600 text-white font-bold rounded-full text-lg hover:bg-gray-800 transition-colors"
            >
                Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 bg-[#05080f]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <Shield size={20} className="text-amunet-accent" />
                <span className="font-bold text-lg">AMUNET AI</span>
            </div>
            <div className="text-gray-500 text-sm">
                © 2024 Amunet Defense Systems. All rights reserved.
            </div>
            <div className="flex gap-6 text-gray-400">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Twitter</a>
                <a href="#" className="hover:text-white">GitHub</a>
            </div>
         </div>
      </footer>
    </div>
  );
};