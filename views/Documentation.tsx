
import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, ChevronRight, Search, Code, Terminal, Shield, Zap, 
  Lock, Server, Layers, AlertTriangle, ExternalLink, Sparkles, 
  ThumbsUp, ThumbsDown, MessageSquare, History, Printer, 
  Download, PlayCircle, Link as LinkIcon, Check 
} from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { amunetApi } from '../services/AmunetAPI';

// --- TYPES ---

type DocSection = {
  id: string;
  title: string;
  category: 'Getting Started' | 'Core Concepts' | 'API Reference' | 'Guides';
  icon: React.ElementType;
  content: React.ReactNode;
  videoId?: string; // Youtube video ID
  relatedIds?: string[];
};

// --- FEATURE COMPONENTS ---

const SectionHeader: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/docs#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <h3 id={id} className="group relative text-lg font-bold text-white mt-6 mb-3 flex items-center gap-2">
      {children}
      <button
        onClick={copyLink}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-800"
        title="Copy link to this section"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <LinkIcon className="w-3 h-3 text-gray-400" />
        )}
      </button>
    </h3>
  );
};

// --- DOCS DATA ---

const DOCS_DATA: DocSection[] = [
  {
    id: 'intro',
    title: 'Introduction to Amunet',
    category: 'Getting Started',
    icon: Shield,
    videoId: 'dQw4w9WgXcQ', // Placeholder ID
    relatedIds: ['mtd-concepts', 'install'],
    content: (
      <div className="space-y-6">
        <p className="text-gray-300 leading-relaxed">
          Amunet AI is an autonomous security platform designed for the modern hybrid cloud. Unlike traditional firewalls that react to signatures, Amunet uses <strong>Moving Target Defense (MTD)</strong> to constantly shift the attack surface, making it mathematically impossible for attackers to conduct reconnaissance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-sentinel-accent/30 transition-colors">
            <h4 className="text-sentinel-accent font-bold mb-2 flex items-center gap-2"><Zap size={16} /> Proactive</h4>
            <p className="text-xs text-gray-400">Predicts threats using behavioral AI before they execute payload.</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-sentinel-warning/30 transition-colors">
            <h4 className="text-sentinel-warning font-bold mb-2 flex items-center gap-2"><Layers size={16} /> Polymorphic</h4>
            <p className="text-xs text-gray-400">Rotates IP addresses, ports, and OS fingerprints every 60 seconds.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'install',
    title: 'Installation Guide',
    category: 'Getting Started',
    icon: Terminal,
    relatedIds: ['api-auth', 'intro'],
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          The Amunet Agent is a lightweight Go binary that runs as a systemd service. It requires root privileges to manage iptables for port hopping.
        </p>
        
        <div className="space-y-4">
          <SectionHeader id="quick-install">1. Quick Install (Linux)</SectionHeader>
          <div className="bg-[#0F1623] p-4 rounded-lg border border-gray-800 group relative">
            <code className="text-sm font-mono text-blue-400">
              curl -sSL https://install.amunet.ai | sudo bash
            </code>
            <div className="absolute top-2 right-2">
              <CopyButton text="curl -sSL https://install.amunet.ai | sudo bash" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader id="configuration">2. Configuration</SectionHeader>
          <p className="text-sm text-gray-400">After installation, configure your API key in <code className="bg-gray-800 px-1 rounded text-gray-200">/etc/amunet/config.yaml</code>:</p>
          <div className="bg-[#0F1623] p-4 rounded-lg border border-gray-800 relative">
            <pre className="text-xs font-mono text-gray-300">
{`agent:
  id: "auto_gen_uuid"
  region: "us-east-1"
  tags: ["production", "payment-api"]

auth:
  api_key: "sk_live_..."  # Paste your key here

policies:
  rotation_interval: 60
  honeypots_enabled: true`}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton text={`agent:\n  id: "auto_gen_uuid"\n  region: "us-east-1"`} label="Copy YAML" />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'mtd-concepts',
    title: 'Moving Target Defense',
    category: 'Core Concepts',
    icon: Layers,
    videoId: 'dQw4w9WgXcQ',
    relatedIds: ['api-endpoints', 'intro'],
    content: (
      <div className="space-y-6">
        <div className="p-4 bg-sentinel-accent/10 border border-sentinel-accent/30 rounded-lg">
          <h4 className="font-bold text-sentinel-accent mb-1">The Concept</h4>
          <p className="text-sm text-gray-300">
            If the target keeps moving, the sniper cannot aim. Amunet constantly changes the network properties of your servers.
          </p>
        </div>

        <SectionHeader id="mechanics">Rotation Mechanics</SectionHeader>
        <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm">
          <li>
            <strong className="text-white">IP Hopping:</strong> The agent interacts with the cloud provider API (AWS EC2, GCP Compute) to detach and reattach Elastic IPs from a pre-warmed pool.
          </li>
          <li>
            <strong className="text-white">Port Shuffling:</strong> Services listening on port 80 internally might be exposed on port 24091 externally, changing every minute.
          </li>
          <li>
            <strong className="text-white">Jitter:</strong> Rotations occur at random intervals (+/- 15%) to prevent attackers from predicting the next shift.
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'api-auth',
    title: 'Authentication',
    category: 'API Reference',
    icon: Lock,
    relatedIds: ['api-endpoints', 'install'],
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          The Amunet Control Plane API uses Bearer Token authentication. You can generate tokens in the Settings panel.
        </p>

        <div className="space-y-2">
          <SectionHeader id="header-format">Header Format</SectionHeader>
          <div className="bg-[#0F1623] p-3 rounded-lg border border-gray-800 font-mono text-sm text-sentinel-warning">
            Authorization: Bearer sk_live_x829...
          </div>
        </div>

        <div className="p-4 bg-sentinel-danger/10 border border-sentinel-danger/30 rounded-lg flex gap-3">
          <AlertTriangle className="text-sentinel-danger shrink-0" />
          <div>
            <h4 className="font-bold text-sentinel-danger text-sm">Security Warning</h4>
            <p className="text-xs text-gray-400 mt-1">Never expose your secret keys in client-side code. Use environment variables.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'api-endpoints',
    title: 'Agents Endpoint',
    category: 'API Reference',
    icon: Server,
    relatedIds: ['api-auth', 'mtd-concepts'],
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold border border-blue-500/30">GET</span>
          <code className="text-white font-mono">https://api.amunet.ai/v1/agents</code>
        </div>

        <p className="text-sm text-gray-400">
          Retrieves a list of all active agents and their current rotation status.
        </p>

        <SectionHeader id="example-response">Example Response</SectionHeader>
        <div className="bg-[#0F1623] p-4 rounded-lg border border-gray-800 relative">
          <pre className="text-xs font-mono text-green-400">
{`{
  "data": [
    {
      "id": "ag-102",
      "hostname": "prod-db-01",
      "ip": "54.21.10.1",
      "status": "active",
      "last_rotation": "2024-10-24T10:00:00Z"
    }
  ],
  "meta": {
    "count": 1
  }
}`}
          </pre>
          <div className="absolute top-2 right-2">
             <CopyButton text={`{"data": [...]}`} label="Copy JSON" />
          </div>
        </div>
      </div>
    )
  }
];

const AskAI: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await amunetApi.askDocsAI(question);
      setAnswer(response);
    } catch (e) {
      setAnswer("I'm having trouble connecting to the neural network. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#2D1B69]/40 to-transparent rounded-xl p-1 mb-8 border border-purple-500/30 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
        <div className="bg-[#0F1623] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <h4 className="text-lg font-semibold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Ask Amunet AI
                </h4>
            </div>
            
            <div className="relative mb-4">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="How do I rotate IPs automatically?"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
                <button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-md text-white text-xs font-bold transition-colors"
                >
                    {loading ? 'Thinking...' : 'Ask'}
                </button>
            </div>
            
            {answer && (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 border border-purple-500/30">
                            <Sparkles size={14} className="text-purple-400" />
                        </div>
                        <div className="text-sm text-gray-300 leading-relaxed">
                            {answer}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const DocFeedback: React.FC<{ docId: string }> = ({ docId }) => {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  const handleVote = (helpful: boolean) => {
    setVoted(helpful ? 'yes' : 'no');
    amunetApi.trackDocFeedback({ docId, helpful, timestamp: Date.now() });
    (window as any).showNotification('success', 'Thank you', 'Your feedback helps improve our docs.');
  };

  return (
    <div className="mt-12 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">Was this page helpful?</div>
            <div className="flex gap-2">
                <button 
                    onClick={() => handleVote(true)}
                    disabled={voted !== null}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${voted === 'yes' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                >
                    <ThumbsUp size={14} /> Yes
                </button>
                <button 
                    onClick={() => handleVote(false)}
                    disabled={voted !== null}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${voted === 'no' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                >
                    <ThumbsDown size={14} /> No
                </button>
            </div>
        </div>
        {voted === 'no' && (
             <textarea 
                placeholder="What went wrong?" 
                className="w-full mt-3 bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white focus:border-gray-500 outline-none"
                rows={2}
             />
        )}
    </div>
  );
};

const RelatedArticles: React.FC<{ relatedIds?: string[]; onNavigate: (id: string) => void }> = ({ relatedIds, onNavigate }) => {
  if (!relatedIds || relatedIds.length === 0) return null;

  return (
    <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
       <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
          <Book size={14} /> Related Articles
       </h4>
       <div className="space-y-2">
          {relatedIds.map(id => {
             const doc = DOCS_DATA.find(d => d.id === id);
             if (!doc) return null;
             return (
               <button 
                 key={id}
                 onClick={() => onNavigate(id)}
                 className="w-full text-left flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded text-sm text-sentinel-accent transition-colors group"
               >
                  <ChevronRight size={12} className="text-gray-500 group-hover:text-sentinel-accent" />
                  {doc.title}
               </button>
             );
          })}
       </div>
    </div>
  );
};

const VideoTutorial: React.FC<{ videoId: string }> = ({ videoId }) => {
    return (
        <div className="my-8 rounded-xl overflow-hidden border border-gray-800 bg-black">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-2">
                   <PlayCircle size={16} className="text-sentinel-accent" />
                   <span className="text-xs font-bold text-gray-300">Video Walkthrough</span>
                </div>
            </div>
            <div className="aspect-video bg-gray-900 relative group cursor-pointer flex items-center justify-center">
                 {/* Simulated Embed for Demo */}
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
                 <div className="w-16 h-16 rounded-full bg-sentinel-accent/90 flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                    <PlayCircle size={32} className="text-black ml-1" />
                 </div>
                 <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="bg-black/80 backdrop-blur px-3 py-2 rounded text-xs text-white">
                        Deploying Amunet Agent in 2 Minutes
                    </div>
                 </div>
            </div>
        </div>
    );
};

const RecentlyViewed: React.FC<{ onNavigate: (id: string) => void }> = ({ onNavigate }) => {
    const [recent, setRecent] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('amunet_recent_docs');
        if (stored) setRecent(JSON.parse(stored));
    }, []);

    if (recent.length === 0) return null;

    return (
        <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                <History size={12} /> Recently Viewed
            </h4>
            <div className="space-y-1">
                {recent.map(id => {
                    const doc = DOCS_DATA.find(d => d.id === id);
                    if (!doc) return null;
                    return (
                        <button 
                            key={id}
                            onClick={() => onNavigate(id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors truncate"
                        >
                            {doc.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const Documentation: React.FC = () => {
  const [activeDocId, setActiveDocId] = useState('intro');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scroll to top on doc change
  const contentRef = useRef<HTMLDivElement>(null);

  const activeDoc = DOCS_DATA.find(d => d.id === activeDocId) || DOCS_DATA[0];

  // Update Recent History
  useEffect(() => {
    const stored = localStorage.getItem('amunet_recent_docs');
    let recent = stored ? JSON.parse(stored) : [];
    recent = [activeDocId, ...recent.filter((id: string) => id !== activeDocId)].slice(0, 5);
    localStorage.setItem('amunet_recent_docs', JSON.stringify(recent));
    
    if (contentRef.current) {
        contentRef.current.scrollTop = 0;
    }
  }, [activeDocId]);

  const categories = Array.from(new Set(DOCS_DATA.map(d => d.category)));

  const filteredDocs = DOCS_DATA.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search docs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:border-sentinel-accent focus:outline-none focus:ring-1 focus:ring-sentinel-accent/50 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
           {categories.map(category => {
             const categoryDocs = filteredDocs.filter(d => d.category === category);
             if (categoryDocs.length === 0) return null;

             return (
               <div key={category}>
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">{category}</h3>
                 <div className="space-y-0.5">
                   {categoryDocs.map(doc => (
                     <button
                       key={doc.id}
                       onClick={() => setActiveDocId(doc.id)}
                       className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border ${
                         activeDocId === doc.id 
                           ? 'bg-sentinel-accent/10 text-sentinel-accent border-sentinel-accent/20 font-medium' 
                           : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                       }`}
                     >
                       <doc.icon size={14} />
                       {doc.title}
                     </button>
                   ))}
                 </div>
               </div>
             );
           })}
           
           <div className="border-t border-gray-800 my-4 pt-4">
               <RecentlyViewed onNavigate={setActiveDocId} />
           </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
            <h4 className="text-white font-bold text-sm mb-1">Need specialized help?</h4>
            <p className="text-xs text-gray-500 mb-3">Our security engineers are available 24/7.</p>
            <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-600 transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={12} /> Contact Support
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col bg-[#0B0F19]">
         {/* Doc Header */}
         <div className="px-8 py-6 border-b border-gray-800 bg-gray-900/30 flex items-start justify-between">
            <div>
                <div className="flex items-center gap-2 text-xs text-sentinel-accent mb-3 font-mono">
                    <span>Docs</span>
                    <ChevronRight size={12} />
                    <span>{activeDoc.category}</span>
                    <ChevronRight size={12} />
                    <span className="font-bold">{activeDoc.title}</span>
                </div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <activeDoc.icon className="text-gray-400" />
                    {activeDoc.title}
                </h1>
            </div>
            
            {/* Tools */}
            <div className="flex gap-2">
                <button onClick={handlePrint} className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Print / Save as PDF">
                    <Printer size={18} />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Download Offline Copy">
                    <Download size={18} />
                </button>
            </div>
         </div>

         {/* Doc Body */}
         <div ref={contentRef} className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth" id="doc-content">
            <div className="max-w-3xl mx-auto">
                <AskAI />
                
                {activeDoc.videoId && <VideoTutorial videoId={activeDoc.videoId} />}

                <div className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-sentinel-accent prose-pre:bg-[#0F1623]">
                    {activeDoc.content}
                </div>

                <RelatedArticles relatedIds={activeDoc.relatedIds} onNavigate={setActiveDocId} />
                
                <DocFeedback docId={activeDoc.id} />

                {/* Footer Navigation */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        Last updated: <span className="text-gray-300">2 days ago</span>
                    </div>
                    <a 
                        href={`https://github.com/amunet-ai/docs/edit/main/${activeDoc.id}.md`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                    >
                        Edit this page on GitHub <ExternalLink size={10} />
                    </a>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Documentation;
