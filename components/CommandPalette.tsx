



import React, { useEffect, useState, useRef } from 'react';
import { Terminal, X, ChevronRight, ShieldAlert, Zap, Activity, Lock, Clock, Download, Save, RefreshCcw, FileText, Search, Eye, Circle } from 'lucide-react';
import { amunetApi } from '../services/AmunetAPI';

// --- TYPES ---

interface Log {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  data?: any;
}

interface Command {
  id: string;
  name: string;
  description: string;
  icon?: React.ElementType;
  action: (args?: string) => Promise<any>;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLockdown: (state: boolean) => void;
  onSentinelMode?: (state: boolean) => void;
}

// --- CONFIGURATION ---

const DEFAULT_ALIASES: Record<string, string> = {
  'ra': 'rotate --all',
  'l': 'lockdown',
  's': 'scan',
  'st': 'status',
  'bl': 'blacklist',
  'wl': 'whitelist',
  'iso': 'isolate',
  'h': 'help',
  'cls': 'clear',
  'w': 'watch',
  't': 'tail',
  '3d': 'sentinel',
  'tr': 'trace',
  'sim': 'simulate',
  'dec': 'decoy'
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onLockdown, onSentinelMode }) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<Log[]>([
    { id: 'init', text: 'Amunet OS v2.5.0 Shell initialized...', type: 'system' },
    { id: 'help', text: 'Type "help" for available commands.', type: 'info' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Advanced States
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 means we are typing a new command
  const [isRecording, setIsRecording] = useState(false);
  const [macroBuffer, setMacroBuffer] = useState<string[]>([]);
  const [isWatchMode, setIsWatchMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- COMMAND DEFINITIONS ---

  const COMMANDS: Command[] = [
    {
      id: 'help',
      name: 'Help',
      description: 'Show available commands',
      action: async () => {
         const helpText = COMMANDS.map(c => `  ${c.id.padEnd(16)} - ${c.description}`).join('\n');
         addLog('AVAILABLE COMMANDS:\n' + helpText, 'info');
      }
    },
    {
      id: 'clear',
      name: 'Clear',
      description: 'Clear terminal output',
      action: async () => setLogs([])
    },
    {
      id: 'sentinel',
      name: 'Sentinel Mode',
      description: 'Launch 3D defense visualization',
      action: async () => {
          if (onSentinelMode) {
              addLog('Initializing Sentinel Core Visualization...', 'success');
              await new Promise(r => setTimeout(r, 800));
              onSentinelMode(true);
              onClose();
          } else {
              addLog('Sentinel Mode not available in this context.', 'error');
          }
      }
    },
    {
      id: 'status',
      name: 'System Status',
      description: 'Show system health matrix',
      action: async () => {
        addLog('Analyzing system telemetry...', 'info');
        await new Promise(resolve => setTimeout(resolve, 600));
        addLog('✔ Neural Core: ONLINE (98ms)', 'success');
        addLog('✔ MTD Engine: ACTIVE', 'success');
        addLog('✔ Deception Grid: 4 Nodes Engaged', 'warning');
      }
    },
    {
      id: 'scan',
      name: 'Threat Scan',
      description: 'Initiate deep threat scan',
      action: async (args) => {
        const target = args || 'Global';
        addLog(`Initiating heuristic scan sequence on [${target}]...`, 'info');
        for (let i = 0; i <= 100; i += 25) {
           await new Promise(r => setTimeout(r, 150));
           addLog(`Scanning segments... ${i}%`, 'system');
        }
        addLog('Scan Complete. 0 Critical Vulnerabilities found.', 'success');
      }
    },
    {
      id: 'audit',
      name: 'Audit Log',
      description: 'Compliance audits. Usage: audit --show controls | --export',
      action: async (args) => {
          if (args?.includes('export')) {
              addLog('Generating SOC 2 Evidence Package...', 'info');
              await amunetApi.exportAuditPackage('SOC2');
              addLog('Evidence Package downloaded successfully.', 'success');
          } else if (args?.includes('controls')) {
              addLog('Fetching Control Status...', 'info');
              const controls = await amunetApi.getComplianceControls();
              controls.forEach(c => {
                  addLog(`[${c.code}] ${c.name}: ${c.status.toUpperCase()}`, c.status === 'Pass' ? 'success' : 'error');
              });
          } else {
              const logs = await amunetApi.getAuditLogs();
              logs.slice(0, 5).forEach(l => addLog(`[${l.timestamp}] ${l.action} by ${l.actor.email}`, 'system'));
          }
      }
    },
    {
      id: 'policy',
      name: 'Policy',
      description: 'Manage policies. Usage: policy --list',
      action: async (args) => {
          if (args?.includes('list')) {
              const policies = await amunetApi.getPolicies();
              policies.forEach(p => {
                  addLog(`${p.title} (${p.version}) - ${p.acknowledged ? 'ACK' : 'PENDING'}`, p.acknowledged ? 'success' : 'warning');
              });
          } else {
              addLog('Usage: policy --list', 'error');
          }
      }
    },
    {
      id: 'train',
      name: 'Retrain Model',
      description: 'Trigger neural network retraining on local data',
      action: async () => {
        addLog('Initiating Neural Engine retraining sequence...', 'info');
        addLog('Ingesting local traffic logs...', 'system');
        await new Promise(r => setTimeout(r, 1000));
        addLog('Normalizing vectors...', 'system');
        await new Promise(r => setTimeout(r, 1000));
        addLog('Updating weights (Backpropagation)...', 'warning');
        
        const res = await amunetApi.retrainModel();
        
        addLog(`✓ Training Complete.`, 'success');
        addLog(`  Accuracy Delta: ${res.accuracyImprovement}`, 'success');
        addLog(`  New Confidence: ${res.confidence}%`, 'success');
        addLog(`  Updated Weights: ${res.featuresUpdated.join(', ')}`, 'system');
      }
    },
    {
      id: 'rotate',
      name: 'Rotate IP',
      description: 'Force IP rotation. Usage: rotate --all or rotate <agent_id>',
      action: async (args) => {
        if (args?.includes('--all') || !args) {
           addLog('Warning: Forcing global rotation sequence.', 'warning');
           const agents = await amunetApi.getAgents();
           agents.forEach(a => amunetApi.forceRotation(a.id));
           addLog(`Command broadcast to ${agents.length} agents.`, 'success');
        } else {
           const id = args.trim();
           await amunetApi.forceRotation(id);
           addLog(`Rotation command sent to agent ${id}`, 'success');
        }
      }
    },
    {
      id: 'lockdown',
      name: 'Lockdown',
      description: 'TRIGGER EMERGENCY LOCKDOWN PROTOCOL',
      action: async () => {
        addLog('⚠️ INITIATING LOCKDOWN PROTOCOL...', 'error');
        addLog('Severing external connections...', 'error');
        await new Promise(resolve => setTimeout(resolve, 1000));
        onLockdown(true);
        amunetApi.triggerLockdown();
        onClose();
      }
    },
    {
      id: 'unlock',
      name: 'Unlock',
      description: 'Disengage lockdown protocol',
      action: async () => {
        onLockdown(false);
        addLog('System normalized. External connections restored.', 'success');
      }
    },
    {
        id: 'isolate',
        name: 'Isolate Agent',
        description: 'Disconnect agent from network. Usage: isolate <agent_id>',
        action: async (args) => {
            if (!args) {
                addLog('Error: Agent ID required. Usage: isolate <agent_id>', 'error');
                return;
            }
            const res = await amunetApi.isolateAgent(args);
            addLog(`Agent ${res.agentId} has been quarantined.`, 'warning');
        }
    },
    {
        id: 'whitelist',
        name: 'Whitelist IP',
        description: 'Add IP to safe list. Usage: whitelist <ip>',
        action: async (args) => {
            if (!args) return addLog('Error: IP required', 'error');
            const res = await amunetApi.whitelistIP(args);
            addLog(`IP ${res.ip} added to global whitelist. Rule ID: ${res.ruleId}`, 'success');
        }
    },
    {
        id: 'blacklist',
        name: 'Blacklist IP',
        description: 'Block IP immediately. Usage: blacklist <ip>',
        action: async (args) => {
            if (!args) return addLog('Error: IP required', 'error');
            const res = await amunetApi.blacklistIP(args);
            addLog(`IP ${res.ip} permanently banned. Rule ID: ${res.ruleId}`, 'error');
        }
    },
    {
        id: 'snapshot',
        name: 'Snapshot',
        description: 'Create security state backup',
        action: async () => {
            addLog('Creating infrastructure state snapshot...', 'info');
            const res = await amunetApi.createSnapshot();
            addLog(`Snapshot ${res.id} created successfully (${res.size}).`, 'success');
        }
    },
    {
        id: 'rollback',
        name: 'Rollback',
        description: 'Revert to previous config',
        action: async () => {
            addLog('Reverting configuration to last stable checkpoint...', 'warning');
            const res = await amunetApi.rollbackConfig();
            addLog(`Rollback complete. Version: ${res.version}`, 'success');
        }
    },
    {
        id: 'export',
        name: 'Export Logs',
        description: 'Download security logs',
        action: async () => {
            addLog('Aggregating logs from distributed nodes...', 'info');
            const logs = await amunetApi.exportLogs();
            addLog(`Exported ${logs.length} records. Starting download...`, 'success');
            // Trigger fake download
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `amunet-logs-${Date.now()}.json`;
            a.click();
        }
    },
    {
        id: 'report',
        name: 'Generate Report',
        description: 'Generate PDF status report',
        action: async () => {
            addLog('Compiling visual report...', 'info');
            await amunetApi.generateReport();
            addLog('PDF Report generated and sent to dashboard.', 'success');
        }
    },
    {
        id: 'alert',
        name: 'Alert Team',
        description: 'Send emergency notification to team',
        action: async (args) => {
            const msg = args || "Emergency attention required in Dashboard.";
            await amunetApi.alertTeam(msg);
            addLog('Broadcast sent to #security-ops and on-call engineers.', 'success');
        }
    },
    {
        id: 'schedule',
        name: 'Schedule',
        description: 'Schedule command. Usage: schedule <cmd> <time>',
        action: async (args) => {
            const parts = args?.split(' ');
            if (!parts || parts.length < 2) {
                addLog('Usage: schedule <command> <time>', 'error');
                return;
            }
            const cmd = parts[0];
            const time = parts.slice(1).join(' ');
            await amunetApi.scheduleCommand(cmd, time);
            addLog(`Scheduled '${cmd}' execution for ${time}`, 'success');
        }
    },
    {
        id: 'watch',
        name: 'Watch Events',
        description: 'Stream security events in real-time',
        action: async () => {
            if (isWatchMode) {
                setIsWatchMode(false);
                addLog('Stopped Watch Mode.', 'info');
                return;
            }
            setIsWatchMode(true);
            addLog('Watch Mode Active. Streaming live events... (Press Cmd+K to close)', 'success');
        }
    },
    {
        id: 'grep',
        name: 'Grep Logs',
        description: 'Search logs. Usage: grep <term>',
        action: async (args) => {
             if (!args) return addLog('Usage: grep <term>', 'error');
             addLog(`Searching logs for "${args}"...`, 'info');
             const results = await amunetApi.searchLogs(args);
             if (results.length > 0) {
                 addLog(`Found ${results.length} matches:`, 'success');
                 results.forEach(r => addLog(`[${r.timestamp}] ${r.message}`, 'system'));
             } else {
                 addLog('No matches found.', 'warning');
             }
        }
    },
    {
        id: 'diff',
        name: 'Diff Config',
        description: 'Compare active config with snapshot',
        action: async () => {
             const snapshots = await amunetApi.listSnapshots();
             addLog(`Comparing current state with ${snapshots[0]}...`, 'info');
             const diff = await amunetApi.compareSnapshots('current', snapshots[0]);
             addLog(diff, 'system');
        }
    },
    {
        id: 'exec',
        name: 'Execute Script',
        description: 'Run saved script. Usage: exec <script_id>',
        action: async (args) => {
            const scripts = await amunetApi.listScripts();
            if (!args) {
                addLog(`Available scripts: ${scripts.join(', ')}`, 'info');
                return;
            }
            addLog(`Executing script: ${args}...`, 'warning');
            const res = await amunetApi.executeScript(args);
            addLog(res.output, 'success');
        }
    },
    {
        id: 'record-start',
        name: 'Record Macro',
        description: 'Start recording command sequence',
        action: async () => {
            setIsRecording(true);
            setMacroBuffer([]);
            addLog('🔴 RECORDING STARTED. Execute commands to add to buffer.', 'warning');
        }
    },
    {
        id: 'record-stop',
        name: 'Stop Recording',
        description: 'Save recorded macro',
        action: async (args) => {
            if (!isRecording) return addLog('Not recording.', 'error');
            setIsRecording(false);
            const name = args || `macro_${Date.now()}`;
            await amunetApi.saveMacro(name, macroBuffer);
            addLog(`⏹️ Macro saved as "${name}" with ${macroBuffer.length} steps.`, 'success');
            addLog(`Run with: exec ${name}`, 'info');
        }
    },
    {
        id: 'rewind',
        name: 'Time Travel',
        description: 'View past state. Usage: rewind <time>',
        action: async (args) => {
            const time = args || '1 hour ago';
            addLog(`⏪ Rewinding system state to ${time}...`, 'info');
            const state = await amunetApi.getStateAt(time);
            addLog(`State loaded: ${JSON.stringify(state)}`, 'success');
            addLog('Visualization mode: READ ONLY', 'warning');
        }
    },
    {
        id: 'ask',
        name: 'Ask AI',
        description: 'Get security advice. Usage: ask <question>',
        action: async (args) => {
            if (!args) return addLog('Usage: ask <question>', 'error');
            addLog('🤖 Asking Amunet AI...', 'info');
            const res = await amunetApi.askAI(args);
            addLog(`AI: ${res.text}`, 'success');
            addLog('Recommended Actions:', 'info');
            res.actions.forEach(a => addLog(`• ${a}`, 'system'));
        }
    },
    {
        id: 'replay-attack',
        name: 'Replay Attack',
        description: 'Simulate historical attack',
        action: async () => {
             const attacks = await amunetApi.listHistoricalAttacks();
             addLog(`Simulating ${attacks[0]}...`, 'error');
             await amunetApi.replayAttack(attacks[0]);
             addLog('Simulation active. Monitor dashboard for impact.', 'warning');
        }
    },
    {
        id: 'benchmark',
        name: 'Benchmark',
        description: 'Test system response performance',
        action: async () => {
            addLog('Running performance benchmark...', 'info');
            const res = await amunetApi.runBenchmark();
            addLog(`⚡ Benchmark Results: Score ${res.score}/100`, 'success');
            addLog(`  Rotation Time: ${res.rotationTime}ms`, 'system');
            addLog(`  Detection Time: ${res.detectionTime}ms`, 'system');
        }
    },
    {
        id: 'trace',
        name: 'Trace Host',
        description: 'Trace network path to origin infrastructure. Usage: trace <ip>',
        action: async (args) => {
            if (!args) return addLog('Error: Target IP or Hostname required.', 'error');
            addLog(`[TRACEBACK PROTOCOL v2.5] Initiating active trace on: [${args}]`, 'info');
            
            // Cinematic sequence
            await new Promise(r => setTimeout(r, 600));
            addLog('› Resolving DNS and initial routing...', 'system');
            await new Promise(r => setTimeout(r, 800));
            addLog('› Detected VPN tunnel: exit node identified...', 'warning');
            await new Promise(r => setTimeout(r, 800));
            addLog('› Cross-referencing BGP announcements...', 'system');
            await new Promise(r => setTimeout(r, 700));
            addLog('› Matching latency patterns to known PoPs...', 'system');
            
            const result = await amunetApi.traceHost(args);
            await new Promise(r => setTimeout(r, 500));
            
            addLog('✓ TRACE COMPLETE.', 'success');
            addLog('PROBABLE ORIGIN:', 'info');
            addLog(` • Country: ${result.country}`, 'system');
            addLog(` • City: ${result.city} (approx.)`, 'system');
            addLog(` • ISP: ${result.isp}`, 'system');
            addLog(` • ASN: ${result.asn}`, 'system');
            addLog(` • Infrastructure: ${result.infrastructure}`, 'system');
            addLog(` • Confidence: ${result.confidence}%`, 'success');
            
            addLog('Disclaimer: Location refers to network infrastructure, not physical residence.', 'system');
        }
    },
    {
      id: 'simulate',
      name: 'Simulate Attack',
      description: 'Run "Red Team" simulation. Usage: simulate <type>',
      action: async (args) => {
        const type = args || 'sql_injection';
        addLog(`[RED TEAM SIMULATOR] Initializing scenario: ${type}`, 'warning');
        
        await new Promise(r => setTimeout(r, 1000));
        addLog(`› Generating 500 simulated malicious payloads...`, 'system');
        await new Promise(r => setTimeout(r, 800));
        addLog(`› Launching campaign against target group: web-frontend...`, 'error');
        
        // Simulate defense response
        await new Promise(r => setTimeout(r, 1200));
        addLog(`[DEFENSE] Amunet detected anomalous traffic pattern (confidence: 0.94)`, 'success');
        addLog(`[DEFENSE] Auto-rotating 4 affected nodes...`, 'info');
        await new Promise(r => setTimeout(r, 500));
        addLog(`[DEFENSE] Routing traffic to High-Fidelity Honeypots...`, 'info');
        await new Promise(r => setTimeout(r, 1000));
        
        addLog(`✓ SIMULATION COMPLETE.`, 'success');
        addLog(`  Production Impact: 0%`, 'system');
        addLog(`  Attacker Cost: High`, 'system');
        addLog(`  Forensic Data: Captured in Honeypot Theater`, 'system');
      }
    },
    {
      id: 'why',
      name: 'Explain Action',
      description: 'Ask Amunet to explain its last action. Usage: why <agent_id>',
      action: async (args) => {
        if (!args) return addLog('Usage: why <agent_id> (or "last")', 'error');
        const target = args === 'last' ? 'web-01' : args;
        addLog(`[EXPLAINABILITY ENGINE] Analyzing decision tree for action on: ${target}...`, 'info');
        
        const explanation = await amunetApi.explainAction(target);
        
        addLog(`Action: ${explanation.action}`, 'system');
        addLog('Reasoning:', 'info');
        explanation.reasoning.forEach(r => addLog(` • ${r}`, 'system'));
        addLog(`Outcome: ${explanation.outcome}`, 'success');
      }
    },
    {
      id: 'playbook',
      name: 'Generate Playbook',
      description: 'Generate incident response plan. Usage: playbook <threat_type>',
      action: async (args) => {
        const threat = args || 'ransomware';
        addLog(`[AI OPS] Generating Incident Response Playbook for: ${threat}...`, 'info');
        
        const playbook = await amunetApi.generatePlaybook(threat);
        
        addLog(`Title: ${playbook.title}`, 'success');
        addLog('Recommended Steps:', 'system');
        playbook.steps.forEach((step, i) => addLog(` ${i+1}. ${step}`, 'system'));
        addLog(`Macro '${playbook.macro}' ready for execution.`, 'warning');
      }
    },
    {
      id: 'theater',
      name: 'Honeypot Theater',
      description: 'Dump recent intercepted payloads',
      action: async () => {
        addLog('Accessing Interceptor Logs...', 'info');
        const logs = await amunetApi.getHoneypotLogs();
        logs.slice(0, 3).forEach(log => {
           addLog(`[${log.timestamp}] ${log.intent} from ${log.sourceIp}`, 'warning');
           addLog(`   Payload: ${log.payload}`, 'system');
        });
        addLog(`... and ${logs.length - 3} more. View full logs in Deception Network.`, 'info');
      }
    },
    {
      id: 'decoy',
      name: 'Deploy Decoy',
      description: 'Spin up Decoy Cluster. Usage: decoy deploy <type>',
      action: async (args) => {
        if (!args || !args.startsWith('deploy')) return addLog('Usage: decoy deploy <Database|Web|Auth|K8s>', 'error');
        const type = args.replace('deploy', '').trim() || 'Web Server';
        addLog(`Provisioning Shadow Infrastructure: [${type}]...`, 'info');
        const res = await amunetApi.deployDecoy(type);
        addLog(`✓ Decoy Cluster ${res.id} active and routing traffic.`, 'success');
      }
    },
    {
      id: 'ghost',
      name: 'Ghost Mode',
      description: 'Toggle infrastructure invisibility',
      action: async () => {
        addLog('Toggling Ghost Mode (Port Obfuscation Protocol)...', 'warning');
        await new Promise(r => setTimeout(r, 1000));
        addLog('✓ Real infrastructure masked from external scans.', 'success');
        addLog('  Public-facing IPs now resolving to Decoy Cloud.', 'system');
      }
    }
  ];

  // --- EFFECTS ---

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Simulate Watch Mode Stream
  useEffect(() => {
      let interval: any;
      if (isWatchMode && isOpen) {
          interval = setInterval(() => {
             const eventTypes: Log['type'][] = ['info', 'warning', 'system', 'success']; 
             const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
             const msgs = [
                 'Packet filtered from 192.168.0.1',
                 'Heartbeat received: ag-aws-01',
                 'Deception node probed on port 22',
                 'Latency check: 12ms',
                 'Analyzing traffic pattern...'
             ];
             const msg = msgs[Math.floor(Math.random() * msgs.length)];
             addLog(`[STREAM] ${msg}`, type);
          }, 1500);
      }
      return () => clearInterval(interval);
  }, [isWatchMode, isOpen]);

  // --- LOGIC ---

  const addLog = (text: string, type: Log['type'] = 'info') => {
    setLogs(prev => [...prev, { id: Math.random().toString(36), text, type }]);
  };

  const parseNaturalCommand = (input: string): { cmd: string, args: string } | null => {
    const lower = input.toLowerCase();
    
    // "ban 1.2.3.4" -> blacklist 1.2.3.4
    if (lower.startsWith('ban ') || lower.startsWith('block ')) {
        return { cmd: 'blacklist', args: lower.split(' ')[1] };
    }
    // "trust 1.2.3.4" -> whitelist 1.2.3.4
    if (lower.startsWith('trust ') || lower.startsWith('allow ')) {
        return { cmd: 'whitelist', args: lower.split(' ')[1] };
    }
    // "show me threats" -> status (simplified)
    if (lower.includes('show') && (lower.includes('threat') || lower.includes('health'))) {
        return { cmd: 'status', args: '' };
    }
    // "rotate all" -> rotate --all
    if (lower.includes('rotate') && (lower.includes('all') || lower.includes('everything'))) {
        return { cmd: 'rotate', args: '--all' };
    }
    // "search logs for X" -> grep X
    if (lower.includes('search') || lower.includes('find')) {
         const match = lower.match(/(?:search|find|grep)(?: logs? for)? (.+)/);
         if (match) return { cmd: 'grep', args: match[1] };
    }
    // "why did you..." -> why
    if (lower.startsWith('why') || lower.includes('explain')) {
         const match = lower.match(/(?:why|explain)(?: did you)?(?: rotate| block| isolate)? (.+)/);
         return { cmd: 'why', args: match ? match[1] : 'last' };
    }
    
    return null;
  };

  const executeCommand = async (cmdString: string) => {
      if (!cmdString.trim()) return;

      // 0. Handle Recording
      if (isRecording && !cmdString.startsWith('record-stop')) {
          setMacroBuffer(prev => [...prev, cmdString]);
      }

      // 1. Handle Chaining (&&)
      if (cmdString.includes('&&')) {
          const parts = cmdString.split('&&');
          for (const part of parts) {
              await executeCommand(part.trim());
              await new Promise(r => setTimeout(r, 500)); // slight delay between chained commands
          }
          return;
      }

      const parts = cmdString.trim().split(' ');
      let baseCmd = parts[0].toLowerCase();
      let args = parts.slice(1).join(' ');

      // 2. Check Aliases
      if (DEFAULT_ALIASES[baseCmd]) {
          const aliasExpansion = DEFAULT_ALIASES[baseCmd].split(' ');
          baseCmd = aliasExpansion[0];
          if (aliasExpansion.length > 1 && !args) {
              args = aliasExpansion.slice(1).join(' ');
          }
      }

      // 3. Natural Language Check
      const nlParsed = parseNaturalCommand(cmdString);
      if (nlParsed) {
          baseCmd = nlParsed.cmd;
          args = nlParsed.args;
      }

      // 4. Find and Execute
      const command = COMMANDS.find(c => c.id === baseCmd);
      
      addLog(`> ${cmdString}`, 'system');
      setIsProcessing(true);

      try {
          if (command) {
              await command.action(args);
          } else {
              // Fallback to AI for unknown commands
              addLog('Command not recognized. Routing to Amunet AI...', 'warning');
              const aiResponse = await amunetApi.askDocsAI(cmdString);
              addLog(aiResponse, 'info');
          }
      } catch (e: any) {
          addLog(`Execution failed: ${e.message}`, 'error');
      } finally {
          setIsProcessing(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmdToRun = input;
    setInput('');
    
    // Add to history
    setCommandHistory(prev => [...prev, cmdToRun]);
    setHistoryIndex(-1); // Reset pointer

    await executeCommand(cmdToRun);
    
    // Refocus
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (commandHistory.length > 0) {
              const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
              setHistoryIndex(newIndex);
              setInput(commandHistory[newIndex]);
          }
      } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex !== -1) {
              const newIndex = historyIndex + 1;
              if (newIndex >= commandHistory.length) {
                  setHistoryIndex(-1);
                  setInput('');
              } else {
                  setHistoryIndex(newIndex);
                  setInput(commandHistory[newIndex]);
              }
          }
      } else if (e.key === 'Tab') {
          e.preventDefault();
          if (input.trim()) {
              // Autocomplete logic
              const term = input.toLowerCase();
              const match = COMMANDS.find(c => c.id.startsWith(term));
              if (match) {
                  setInput(match.id + ' ');
              }
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-[#0B0F19] border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[600px] relative transition-all duration-300"
        onClick={e => e.stopPropagation()}
        style={{ 
            boxShadow: isRecording 
                ? '0 0 50px rgba(220, 38, 38, 0.3)' 
                : isWatchMode 
                    ? '0 0 50px rgba(0, 240, 255, 0.15)'
                    : '0 0 50px rgba(0, 0, 0, 0.5)' 
        }}
      >
        {/* Header */}
        <div className="bg-[#111827] px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Terminal size={16} className={isRecording ? "text-red-500 animate-pulse" : "text-sentinel-accent"} />
            <span className="text-xs font-mono font-bold tracking-wider">
                AMUNET_CLI_ROOT // v2.5.0
                {isRecording && <span className="ml-2 text-red-500">[REC]</span>}
                {isWatchMode && <span className="ml-2 text-sentinel-accent">[LIVE]</span>}
            </span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex gap-1">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
             </div>
             <button onClick={onClose} className="text-gray-500 hover:text-white ml-2">
               <X size={16} />
             </button>
          </div>
        </div>

        {/* Body */}
        <div 
            className="p-4 overflow-y-auto flex-1 bg-[#0B0F19]/95 font-mono text-sm min-h-[400px] scrollbar-none" 
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
            onClick={() => inputRef.current?.focus()}
        >
           {logs.map(log => (
             <div key={log.id} className={`mb-1.5 leading-relaxed break-words animate-in slide-in-from-left-2 duration-100 ${
                log.type === 'error' ? 'text-sentinel-danger' :
                log.type === 'success' ? 'text-sentinel-success' :
                log.type === 'warning' ? 'text-sentinel-warning' :
                log.type === 'system' ? 'text-gray-500 italic' :
                'text-gray-300'
             }`}>
               {log.type !== 'system' && <span className="mr-2 opacity-50 select-none">{'>'}</span>}
               {log.text}
             </div>
           ))}
           {isProcessing && (
             <div className="flex items-center gap-2 text-sentinel-accent mt-2">
                 <div className="w-2 h-4 bg-sentinel-accent animate-pulse"></div>
                 <span>Processing...</span>
             </div>
           )}
           <div ref={bottomRef} />
        </div>

        {/* Footer / Input */}
        <form onSubmit={handleSubmit} className="relative p-0 bg-[#111827] border-t border-gray-700">
            <div className="flex items-center px-4 py-3 gap-3">
                <ChevronRight className="text-sentinel-accent animate-pulse" size={20} />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder-gray-600"
                  placeholder={isRecording ? "Recording macro... (type 'record-stop' to save)" : "Enter command (try 'audit', 'policy', 'decoy')..."}
                  autoComplete="off"
                  autoFocus
                />
                {isWatchMode && <Eye className="text-sentinel-accent animate-pulse" size={16} />}
                {isRecording && <Circle className="text-red-500 animate-pulse fill-red-500" size={12} />}
            </div>
            
            {/* Helper Hints */}
            <div className="absolute bottom-full left-0 right-0 bg-[#1F2937] border-t border-gray-700 px-4 py-1.5 flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                <div className="flex gap-3">
                    <span>History: ↑ ↓</span>
                    <span>Autocomplete: Tab</span>
                    <span>Chain: &&</span>
                </div>
                <div>CMD+K</div>
            </div>
        </form>
      </div>
    </div>
  );
};
