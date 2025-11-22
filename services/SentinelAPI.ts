
import { Agent, Threat, User, AuthResponse, AnalyticsData } from '../types';
import { MOCK_AGENTS, generateRandomIP, MOCK_ANALYTICS } from '../constants';

// Default configuration
const DEFAULT_API_URL = 'http://localhost:8000';
const DEFAULT_WS_URL = 'ws://localhost:8000/ws';

export class AmunetAPI {
  private agents: Agent[] = [...MOCK_AGENTS];
  private subscribers: ((event: any) => void)[] = [];
  private simulationInterval: any;
  
  // Real Backend State
  private useRealBackend = false;
  private apiUrl: string;
  private wsUrl: string;
  private socket: WebSocket | null = null;
  private connectionRetries = 0;
  private authToken: string | null = null;

  constructor() {
    // Load settings from localStorage or use defaults
    this.apiUrl = localStorage.getItem('AMUNET_API_URL') || DEFAULT_API_URL;
    this.wsUrl = localStorage.getItem('AMUNET_WS_URL') || DEFAULT_WS_URL;
    this.authToken = localStorage.getItem('amunet_token');
    
    this.init();
  }

  private async init() {
    try {
      // fast health check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const response = await fetch(`${this.apiUrl}/`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Connected to Amunet Control Plane');
        this.useRealBackend = true;
        this.connectWebSocket();
      } else {
        throw new Error('Backend not ready');
      }
    } catch (e) {
      console.log('⚠️ Control Plane unreachable. Switching to Simulation Mode.');
      this.useRealBackend = false;
      this.startSimulation();
    }
  }

  public isUsingRealBackend(): boolean {
    return this.useRealBackend;
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  public setBackendUrl(httpUrl: string, wsUrl: string) {
    this.apiUrl = httpUrl;
    this.wsUrl = wsUrl;
    localStorage.setItem('AMUNET_API_URL', httpUrl);
    localStorage.setItem('AMUNET_WS_URL', wsUrl);
    window.location.reload(); // Reload to re-init connection
  }

  private getHeaders() {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // ----------------------------------------------------------------
  // AUTH METHODS
  // ----------------------------------------------------------------

  async login(email: string, password: string): Promise<AuthResponse> {
      if (this.useRealBackend) {
          const res = await fetch(`${this.apiUrl}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          });
          if (!res.ok) throw new Error('Invalid credentials');
          return await res.json();
      } else {
          // Mock Login
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
          if (email === 'demo@amunet.ai' && password === 'demo123') {
              return {
                  access_token: 'mock-jwt-token-xyz-123',
                  user: {
                      id: 'u-1',
                      email: 'demo@amunet.ai',
                      companyName: 'Amunet Demo Corp',
                      role: 'admin',
                      plan: 'startup'
                  }
              };
          }
          throw new Error('Invalid credentials');
      }
  }

  // ----------------------------------------------------------------
  // BILLING METHODS
  // ----------------------------------------------------------------

  async createCheckoutSession(plan: string): Promise<{ url: string }> {
      if (this.useRealBackend) {
          const res = await fetch(`${this.apiUrl}/api/billing/create-checkout-session`, {
              method: 'POST',
              headers: this.getHeaders(),
              body: JSON.stringify({ plan })
          });
          return await res.json();
      } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { url: '#' }; // In simulation, we just return dummy
      }
  }

  // ----------------------------------------------------------------
  // DATA METHODS
  // ----------------------------------------------------------------

  async getAnalytics(): Promise<AnalyticsData> {
      if (this.useRealBackend) {
          try {
              const res = await fetch(`${this.apiUrl}/api/analytics`, { headers: this.getHeaders() });
              return await res.json();
          } catch (e) {
              console.error("Failed to fetch analytics", e);
              return MOCK_ANALYTICS;
          }
      } else {
          await new Promise(resolve => setTimeout(resolve, 600));
          return MOCK_ANALYTICS;
      }
  }

  async getAgents(): Promise<Agent[]> {
    if (this.useRealBackend) {
      try {
        const res = await fetch(`${this.apiUrl}/api/agents`, { headers: this.getHeaders() });
        const data = await res.json();
        return data.map(this.mapBackendAgentToFrontend);
      } catch (e) {
        console.error("Failed to fetch agents", e);
        return [];
      }
    } else {
      // Simulation Delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return [...this.agents];
    }
  }

  async forceRotation(agentId: string) {
    if (this.useRealBackend) {
      await fetch(`${this.apiUrl}/api/agents/${agentId}/rotate`, { 
          method: 'POST',
          headers: this.getHeaders()
      });
    } else {
      // Simulation Logic
      const agentIndex = this.agents.findIndex(a => a.id === agentId);
      if (agentIndex > -1) {
        this.agents[agentIndex].status = 'Rotating';
        this.emit({ type: 'agent_update', data: this.agents[agentIndex] });
        
        setTimeout(() => {
          if (this.agents[agentIndex]) {
            this.agents[agentIndex].ip = generateRandomIP();
            this.agents[agentIndex].status = 'Active';
            this.emit({ type: 'rotation_complete', data: { agentId, newIp: this.agents[agentIndex].ip } });
            this.emit({ type: 'agent_update', data: this.agents[agentIndex] });
          }
        }, 2000);
      }
    }
  }
  
  // WOW FACTOR - LOCKDOWN PROTOCOL
  triggerLockdown() {
    // Broadcasts a lockdown event to the dashboard (making it turn red)
    // and forces rotation on all agents
    this.agents.forEach(a => {
        if (a.status !== 'Rotating') this.forceRotation(a.id);
    });
    this.emit({ type: 'lockdown_initiated' });
  }

  // ----------------------------------------------------------------
  // ADVANCED CLI ACTIONS
  // ----------------------------------------------------------------

  async isolateAgent(agentId: string) {
    console.log(`[API] Isolating agent ${agentId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const agent = this.agents.find(a => a.id === agentId || a.hostname === agentId);
    if (agent) {
        agent.status = 'Disconnected';
        this.emit({ type: 'agent_update', data: agent });
    }
    return { success: true, status: 'Isolated', agentId };
  }

  async whitelistIP(ip: string) {
    console.log(`[API] Whitelisting IP ${ip}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, ip, ruleId: `wl-${Math.floor(Math.random() * 1000)}`, ttl: 'permanent' };
  }

  async blacklistIP(ip: string) {
    console.log(`[API] Blacklisting IP ${ip}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    this.emit({ type: 'intrusion_detected', data: { sourceIp: ip, type: 'Manual Block - CLI' } });
    return { success: true, ip, ruleId: `bl-${Math.floor(Math.random() * 1000)}`, region: 'Global' };
  }

  async createSnapshot() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { id: `snap-${Date.now()}`, timestamp: Date.now(), size: '24MB', content: 'Full State' };
  }

  async rollbackConfig() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, version: 'v2.4.9-stable', timestamp: Date.now() };
  }

  async exportLogs() {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return Array.from({ length: 50 }).map((_, i) => ({
        id: `log-${i}`, 
        timestamp: new Date(Date.now() - i * 60000).toISOString(), 
        level: Math.random() > 0.8 ? 'WARN' : 'INFO', 
        msg: 'System event logged via CLI export'
    }));
  }

  async generateReport() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { url: '/reports/security-summary.pdf', generatedAt: new Date().toISOString() };
  }

  async alertTeam(message: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { recipients: 4, channel: 'Slack #security-ops', sent: true };
  }

  async scheduleCommand(command: string, time: string) {
     await new Promise(resolve => setTimeout(resolve, 500));
     return { id: `job-${Date.now()}`, command, scheduledFor: time, status: 'pending' };
  }

  async rollbackDeployment(agentId: string) {
      // Simulate rollback process
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
  }

  async updateRotationInterval(agentId: string, seconds: number) {
    if (this.useRealBackend) {
      await fetch(`${this.apiUrl}/api/agents/${agentId}/config`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ rotation_interval: seconds })
      });
    } else {
      const agent = this.agents.find(a => a.id === agentId);
      if (agent) {
        agent.rotationInterval = seconds;
        this.emit({ type: 'config_update', data: { agentId, config: { rotationInterval: seconds } } });
      }
    }
  }

  // --- NEW ADVANCED FEATURES ---

  async searchLogs(term: string) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
        { timestamp: new Date().toISOString(), message: `Found occurrence of '${term}' in auth.log` },
        { timestamp: new Date(Date.now() - 10000).toISOString(), message: `[WARN] ${term} triggered alert #992` }
    ];
  }

  async listSnapshots() {
      return ['snap-recent', 'snap-yesterday', 'snap-stable-v2'];
  }

  async compareSnapshots(s1: string, s2: string) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return `DIFF ${s1} vs ${s2}:\n- firewall_rule: allow 80\n+ firewall_rule: allow 443 only\n+ mtd_interval: 30s`;
  }

  async listScripts() {
      return ['incident-response', 'daily-maintenance', 'hard-reset'];
  }

  async executeScript(scriptId: string) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { output: `Executing ${scriptId}...\nStep 1: OK\nStep 2: OK\nDone.` };
  }

  async saveMacro(name: string, commands: string[]) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Saved macro ${name}:`, commands);
      localStorage.setItem(`macro_${name}`, JSON.stringify(commands));
      return true;
  }

  async getMacro(name: string): Promise<string[]> {
      const stored = localStorage.getItem(`macro_${name}`);
      return stored ? JSON.parse(stored) : [];
  }

  async getStateAt(timestamp: string) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { status: 'Restored View', time: timestamp, activeThreats: 0 };
  }

  async askAI(question: string) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // thinking
      return {
          text: `Based on the system telemetry, '${question}' relates to recent port scanning activity from known botnets.`,
          actions: ['Block Subnet 192.168.x.x', 'Increase MTD rotation frequency', 'Review Auth Logs']
      };
  }

  async listHistoricalAttacks() {
      return ['ddos-attack-nov-12', 'sql-injection-attempt-oct-30', 'ransomware-sim-01'];
  }

  async replayAttack(attackId: string) {
      console.log(`Replaying ${attackId}`);
      // Simulate effects
      setTimeout(() => {
          this.emit({ type: 'intrusion_detected', data: { sourceIp: 'SIMULATED_ATTACKER', type: 'Replay Attack' }});
      }, 2000);
      return true;
  }

  async runBenchmark() {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return {
          rotationTime: 45,
          detectionTime: 12,
          commandLatency: 5,
          score: 98
      };
  }

  // --- MODEL TRAINING SIMULATION ---

  async retrainModel() {
    // Simulate the latency of a lightweight retraining cycle
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {
        newVersion: "v2.5.1-local-dev",
        confidence: 99.95,
        accuracyImprovement: "+0.03%",
        featuresUpdated: ["Geo-IP Weighting", "Request Velocity", "Payload Entropy"]
    };
  }

  // --- TRACEBACK CAPABILITY (UPDATED) ---

  async traceHost(ip: string) {
    // Realistic network infrastructure endpoints instead of residential addresses
    const locations = [
      { city: "Shanghai", country: "China", isp: "Alibaba Cloud", asn: "AS37963", infrastructure: "CN-East-1 Data Center", coords: "31.2304° N, 121.4737° E" },
      { city: "St. Petersburg", country: "Russia", isp: "Selectel Ltd.", asn: "AS49505", infrastructure: "SPB-1 Tier III Data Center", coords: "59.9343° N, 30.3351° E" },
      { city: "Lagos", country: "Nigeria", isp: "MainOne Cable", asn: "AS37282", infrastructure: "MDXi Data Center Lekki", coords: "6.5244° N, 3.3792° E" },
      { city: "Bucharest", country: "Romania", isp: "M247 Ltd", asn: "AS9009", infrastructure: "Bucharest Edge Node", coords: "44.4268° N, 26.1025° E" },
      { city: "Pyongyang", country: "North Korea", isp: "Star Joint Venture", asn: "AS131279", infrastructure: "Potonggang Ryugyong Node", coords: "39.0392° N, 125.7625° E" },
      { city: "Amsterdam", country: "Netherlands", isp: "DigitalOcean", asn: "AS14061", infrastructure: "AMS3 Data Center", coords: "52.3676° N, 4.9041° E" }
    ];
    
    // Deterministic random based on IP length
    const index = ip.length % locations.length;
    const loc = locations[index];

    return {
        ip,
        ...loc,
        proxyDetected: true,
        hops: Math.floor(Math.random() * 15) + 5,
        confidence: Math.floor(Math.random() * 15) + 75 // 75-90%
    };
  }

  // ----------------------------------------------------------------
  // DOCS & AI METHODS
  // ----------------------------------------------------------------

  async trackDocFeedback(data: { docId: string; helpful: boolean; timestamp: number; feedback?: string }) {
    console.log('[Analytics] Doc Feedback Received:', data);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true };
  }

  async askDocsAI(question: string): Promise<string> {
    console.log('[AI] Processing Query:', question);
    await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate "thinking"
    
    // Simple keyword matching for demo purposes
    const q = question.toLowerCase();
    if (q.includes('install') || q.includes('setup')) {
        return "To install the Amunet Agent, run the following command on your Linux server: `curl -sSL https://install.amunet.ai | sudo bash`. Ensure you have root privileges and port 443 open for outbound traffic.";
    } else if (q.includes('rotate') || q.includes('mtd') || q.includes('ip')) {
        return "Amunet's Moving Target Defense (MTD) automatically rotates IP addresses every 60 seconds by default. You can configure this interval in the Settings page under 'Network Defense Policies' or via the `rotation_interval` parameter in your config file.";
    } else if (q.includes('api') || q.includes('key')) {
        return "API authentication is handled via Bearer tokens. You can generate a new API key in the Settings > Connection tab. Remember to keep this key secure and never expose it in client-side code.";
    } else {
        return "I found several articles that might help. The Amunet platform utilizes autonomous agents to protect your infrastructure. Could you be more specific about which feature (MTD, Deception, or Zero Trust) you are interested in?";
    }
  }

  subscribeToRealTimeEvents(callback: (event: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // ----------------------------------------------------------------
  // PRIVATE HELPERS
  // ----------------------------------------------------------------

  private mapBackendAgentToFrontend(backendAgent: any): Agent {
    return {
      id: backendAgent.id,
      hostname: backendAgent.hostname,
      ip: backendAgent.current_ip || 'Allocating...',
      provider: (backendAgent.cloud_provider?.toUpperCase() as any) || 'AWS',
      region: 'us-east-1', // Default if missing
      status: backendAgent.status === 'online' ? 'Active' : (backendAgent.status === 'offline' ? 'Disconnected' : 'Rotating'),
      version: 'v2.5.0',
      lastHeartbeat: new Date(backendAgent.last_seen).getTime(),
      rotationInterval: backendAgent.rotation_interval,
      activePorts: [80, 443, 22], // Mock if missing from backend
      honeypotsActive: 2,
      cpuUsage: backendAgent.cpu_usage || 12,
      memoryUsage: backendAgent.memory_usage || 34,
      latency: backendAgent.latency || 18
    };
  }

  private connectWebSocket() {
    if (this.socket) return;
    
    try {
      this.socket = new WebSocket(this.wsUrl);
      
      this.socket.onopen = () => {
        console.log('WS Connected');
        this.connectionRetries = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stats_update') {
          // Trigger a refresh of agents when stats change significantly or just emit general update
          this.emit({ type: 'agent_update' });
        } else {
          this.emit(data);
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        // Simple exponential backoff
        const timeout = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);
        this.connectionRetries++;
        setTimeout(() => this.connectWebSocket(), timeout);
      };
    } catch (e) {
      console.error('WS Connection failed', e);
    }
  }

  private emit(event: any) {
    this.subscribers.forEach(cb => cb(event));
  }

  private startSimulation() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    
    this.simulationInterval = setInterval(() => {
      // Randomly simulate heartbeat updates
      this.agents.forEach(agent => {
        if (Math.random() > 0.7) {
           agent.lastHeartbeat = Date.now();
           if (Math.random() > 0.95) {
             this.forceRotation(agent.id);
           }
        }
      });

      // Randomly simulate intrusion
      if (Math.random() > 0.97) {
        this.emit({
          type: 'intrusion_detected',
          data: {
            id: `threat-${Date.now()}`,
            type: 'Port Scan',
            sourceIp: generateRandomIP(),
            targetService: 'SSH',
            timestamp: Date.now(),
            predictionConfidence: 99,
            status: 'Blocked',
            location: 'Unknown'
          } as Threat
        });
      }
    }, 3000);
  }
}

export const amunetApi = new AmunetAPI();
