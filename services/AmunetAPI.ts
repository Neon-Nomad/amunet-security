



import { Agent, Threat, User, AuthResponse, AnalyticsData, DecoyCluster, ComplianceControl, AuditLog, Policy } from '../types';
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

  // Dynamic Runtime State
  private runtimeLogs: AuditLog[] = [];
  private historicalLogs: AuditLog[] = [];
  private users: User[] = [
      { id: 'u-1', email: 'alice@amunet.ai', role: 'admin', companyName: 'Amunet Corp', plan: 'enterprise' },
      { id: 'u-2', email: 'bob.security@amunet.ai', role: 'viewer', companyName: 'Amunet Corp', plan: 'enterprise' },
      { id: 'u-3', email: 'external.auditor@deloitte.com', role: 'auditor', companyName: 'Amunet Corp', plan: 'enterprise' }
  ];

  constructor() {
    // Load settings from localStorage or use defaults
    this.apiUrl = localStorage.getItem('AMUNET_API_URL') || DEFAULT_API_URL;
    this.wsUrl = localStorage.getItem('AMUNET_WS_URL') || DEFAULT_WS_URL;
    this.authToken = localStorage.getItem('amunet_token');
    
    this.initLogs();
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

  private initLogs() {
      const actions = ['Rotation Executed', 'Policy Update', 'User Login', 'Export Data', 'Key Rotation', 'Honeypot Deploy'];
      const roles = ['Admin', 'System', 'Analyst', 'Auditor'];
      
      this.historicalLogs = Array.from({length: 20}).map((_, i) => {
          const isSystem = i % 4 === 0;
          return {
              id: `hist-log-${i}`,
              timestamp: new Date(Date.now() - (i + 1) * 900000).toISOString(),
              actor: {
                  email: isSystem ? 'system@amunet.ai' : 'alice@amunet.ai',
                  role: isSystem ? 'System' : roles[i % roles.length],
                  ip: '10.0.0.5'
              },
              action: actions[i % actions.length],
              resource: `res-${i}`,
              status: i === 3 ? 'failure' : (i === 7 ? 'warning' : 'success'),
              hash: `sha256-${Math.random().toString(36).substring(7)}`
          };
      });
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
  // INTERNAL LOGGING HELPER
  // ----------------------------------------------------------------

  private logAction(action: string, resource: string, status: 'success' | 'failure' | 'warning' = 'success') {
      const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: {
              email: 'demo@amunet.ai', // Current user
              role: 'Admin',
              ip: '10.0.0.5'
          },
          action: action,
          resource: resource,
          status: status,
          hash: `sha256-${Math.random().toString(36).substring(7)}` // Simulating hash
      };
      this.runtimeLogs.unshift(newLog);
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
              this.logAction('User Login', 'Auth Service');
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
      this.logAction('Initiate Checkout', `Plan: ${plan}`);
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
    this.logAction('MTD Rotation Executed', `Agent: ${agentId}`);
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
    this.logAction('LOCKDOWN PROTOCOL INITIATED', 'Global Scope', 'success');
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
    this.logAction('Agent Isolation', `Agent: ${agentId}`);
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
    this.logAction('IP Whitelist Added', `IP: ${ip}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, ip, ruleId: `wl-${Math.floor(Math.random() * 1000)}`, ttl: 'permanent' };
  }

  async blacklistIP(ip: string) {
    console.log(`[API] Blacklisting IP ${ip}`);
    this.logAction('IP Blacklist Added', `IP: ${ip}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    this.emit({ type: 'intrusion_detected', data: { sourceIp: ip, type: 'Manual Block - CLI' } });
    return { success: true, ip, ruleId: `bl-${Math.floor(Math.random() * 1000)}`, region: 'Global' };
  }

  async createSnapshot() {
    this.logAction('System Snapshot Created', 'Infrastructure State');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { id: `snap-${Date.now()}`, timestamp: Date.now(), size: '24MB', content: 'Full State' };
  }

  async rollbackConfig() {
    this.logAction('Config Rollback', 'Global Config', 'warning');
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
      this.logAction('Attack Simulation', `Scenario: ${attackId}`, 'warning');
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
    this.logAction('Neural Model Retraining', 'AI Core');
    // Simulate the latency of a lightweight retraining cycle
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {
        newVersion: "v2.5.1-local-dev",
        confidence: 99.95,
        accuracyImprovement: "+0.03%",
        featuresUpdated: ["Geo-IP Weighting", "Request Velocity", "Payload Entropy"]
    };
  }

  // --- TRACEBACK CAPABILITY ---

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

  // --- HONEYPOT THEATER & FORENSICS ---

  async getHoneypotLogs() {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { id: 'hp-1', timestamp: new Date().toISOString(), service: 'ssh', sourceIp: '192.168.1.55', payload: 'root:toor', intent: 'Brute Force / Default Creds', country: 'RU' },
      { id: 'hp-2', timestamp: new Date(Date.now() - 50000).toISOString(), service: 'http', sourceIp: '45.33.22.11', payload: "' OR 1=1; --", intent: 'SQL Injection (Auth Bypass)', country: 'CN' },
      { id: 'hp-3', timestamp: new Date(Date.now() - 120000).toISOString(), service: 'api', sourceIp: '103.22.11.9', payload: '/etc/passwd', intent: 'LFI (Local File Inclusion)', country: 'BR' },
      { id: 'hp-4', timestamp: new Date(Date.now() - 300000).toISOString(), service: 'telnet', sourceIp: '185.22.11.5', payload: 'enable; system', intent: 'Command Injection', country: 'KP' }
    ];
  }

  async explainAction(resourceId: string) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      action: `Rotated IP for agent ${resourceId}`,
      reasoning: [
        "Anomaly score exceeded 0.85 threshold",
        "Detected sequential port knocking pattern on port 22, 80, 443",
        "Source IP correlates with known Mirai botnet subnet"
      ],
      outcome: "Attacker session severed. Reconnaissance data invalidated."
    };
  }

  async generatePlaybook(threatType: string) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      title: `Response Protocol: ${threatType}`,
      steps: [
        "Isolate affected subnet (VLAN-4)",
        "Snapshot current memory state of targeting nodes",
        "Rotate all administrative credentials",
        "Deploy 5 additional high-interaction honeypots",
        "Notify legal/compliance team (GDPR trigger)"
      ],
      macro: `response_${threatType.replace(/\s+/g, '_').toLowerCase()}`
    };
  }

  async verifyAIConfig(provider: string, key: string) {
      // Simulate a connection check to the external LLM
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (key.length < 10) throw new Error("Invalid Key");
      this.logAction('AI Provider Configured', `Provider: ${provider}`);
      return true;
  }

  // --- DECOY CLOUD ---

  async getDecoyClusters(): Promise<DecoyCluster[]> {
      await new Promise(resolve => setTimeout(resolve, 600));
      return [
          { id: 'dc-1', name: 'Shadow-DB-Primary', type: 'Database', status: 'Under Attack', attacksDiverted: 1420, resourceUsage: 88, uptime: '4d 2h', costToAttacker: 4500 },
          { id: 'dc-2', name: 'Legacy-Auth-Gateway', type: 'Auth Service', status: 'Active', attacksDiverted: 320, resourceUsage: 12, uptime: '12h 30m', costToAttacker: 850 },
          { id: 'dc-3', name: 'K8s-Dev-Cluster', type: 'Kubernetes Cluster', status: 'Compromised', attacksDiverted: 8500, resourceUsage: 99, uptime: '2d 5h', costToAttacker: 12000 }
      ];
  }

  async deployDecoy(type: string) {
      this.logAction('Decoy Deployment', `Type: ${type}`);
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, id: `dc-${Date.now()}`, type };
  }

  async purgeDecoys() {
    this.logAction('Decoy Purge', 'Compromised Nodes');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, purged: 2 };
  }

  // --- COMPLIANCE & AUDIT ---

  async getComplianceControls(): Promise<ComplianceControl[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: '1', code: 'CC6.1', name: 'Logical Access Security', description: 'MFA is enforced for all admin access.', category: 'Security', status: 'Pass', lastChecked: new Date().toISOString(), evidenceCount: 12 },
      { id: '2', code: 'A1.2', name: 'Failover Redundancy', description: 'Backup nodes available in secondary region.', category: 'Availability', status: 'Warning', lastChecked: new Date().toISOString(), evidenceCount: 8 },
      { id: '3', code: 'C1.1', name: 'Data Encryption', description: 'Data at rest encryped with AES-256.', category: 'Confidentiality', status: 'Pass', lastChecked: new Date().toISOString(), evidenceCount: 6 },
      { id: '4', code: 'CC7.1', name: 'Vulnerability Detection', description: 'Continuous scanning for critical CVEs.', category: 'Security', status: 'Pass', lastChecked: new Date().toISOString(), evidenceCount: 45 },
      { id: '5', code: 'P3.2', name: 'Data Retention Policy', description: 'Logs retained for min 30 days.', category: 'Privacy', status: 'Fail', lastChecked: new Date().toISOString(), evidenceCount: 0 },
    ];
  }

  async getAuditLogs(filters?: any): Promise<AuditLog[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...this.runtimeLogs, ...this.historicalLogs];
  }

  async getPolicies(): Promise<Policy[]> {
      return [
          { 
            id: 'p1', 
            title: 'Information Security Policy', 
            version: 'v2.4', 
            lastUpdated: '2024-10-01', 
            acknowledged: true, 
            status: 'Active', 
            category: 'Access',
            content: `
              <h4>1. Purpose</h4>
              <p>This policy defines the guidelines for protecting the confidentiality, integrity, and availability of Amunet Corp's information assets.</p>
              <h4>2. Access Control</h4>
              <ul>
                <li>Multi-Factor Authentication (MFA) is required for all cloud console access.</li>
                <li>API Keys must be rotated every 90 days.</li>
                <li>Least privilege access must be reviewed quarterly.</li>
              </ul>
              <h4>3. Data Classification</h4>
              <p>All data must be classified as Public, Internal, Confidential, or Restricted.</p>
            `
          },
          { 
            id: 'p2', 
            title: 'Incident Response Plan', 
            version: 'v1.1', 
            lastUpdated: '2024-09-15', 
            acknowledged: false, 
            status: 'Review', 
            category: 'Incident',
            content: `
              <h4>1. Initial Response</h4>
              <p>Upon detection of a security incident, the IRT must be notified immediately via the secure Slack channel #incident-ops.</p>
              <h4>2. Containment Strategy</h4>
              <p>Isolate affected systems using Amunet's lockdown protocol. Do not power off machines to preserve volatile memory evidence.</p>
              <h4>3. Eradication & Recovery</h4>
              <p>Identify the root cause, patch vulnerabilities, and restore systems from clean backups.</p>
            `
          },
          { 
            id: 'p3', 
            title: 'Data Privacy & Handling', 
            version: 'v3.0', 
            lastUpdated: '2024-10-20', 
            acknowledged: true, 
            status: 'Active', 
            category: 'Data',
            content: `
              <h4>1. GDPR Compliance</h4>
              <p>Amunet processes personal data in accordance with GDPR and CCPA regulations.</p>
              <h4>2. Data Retention</h4>
              <p>Customer logs are retained for 30 days unless an extended retention period is purchased.</p>
              <h4>3. Third-Party Subprocessors</h4>
              <p>All vendors must pass a security assessment before handling customer data.</p>
            `
          },
      ];
  }

  async acknowledgePolicy(id: string, userId: string) {
      this.logAction('Policy Acknowledged', `Policy ID: ${id}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
  }

  async exportAuditPackage(format: 'SOC2' | 'ISO27001') {
      this.logAction('Evidence Export', `Format: ${format}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { url: '#', size: '45MB', generatedAt: new Date().toISOString() };
  }

  async runComplianceTest(controlId: string) {
      this.logAction('Compliance Test Run', `Control: ${controlId}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, status: 'Pass', timestamp: Date.now() };
  }

  // ----------------------------------------------------------------
  // TEAM MANAGEMENT
  // ----------------------------------------------------------------

  async getUsers(): Promise<User[]> {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...this.users];
  }

  async inviteUser(email: string, role: string) {
      this.logAction('User Invited', `Email: ${email}, Role: ${role}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.users.push({
          id: `u-${Date.now()}`,
          email,
          role: role as any,
          companyName: 'Amunet Corp',
          plan: 'enterprise'
      });
      return true;
  }

  async removeUser(userId: string) {
      this.logAction('User Removed', `ID: ${userId}`);
      this.users = this.users.filter(u => u.id !== userId);
      return true;
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
        // Simulation: Jitter Resource Usage to look alive
        if (agent.status === 'Active') {
            // Fluctuate CPU +/- 5%
            const cpuDelta = Math.floor(Math.random() * 10) - 5;
            agent.cpuUsage = Math.max(5, Math.min(99, agent.cpuUsage + cpuDelta));
            
            // Fluctuate Memory +/- 2%
            const memDelta = Math.floor(Math.random() * 4) - 2;
            agent.memoryUsage = Math.max(10, Math.min(95, agent.memoryUsage + memDelta));

            // Fluctuate Latency
            if (Math.random() > 0.9) {
                // Random Spike
                agent.latency = Math.floor(Math.random() * 150) + 50;
            } else {
                // Normalize
                agent.latency = Math.floor(Math.random() * 20) + 10;
            }
        }

        if (Math.random() > 0.7) {
           agent.lastHeartbeat = Date.now();
           if (Math.random() > 0.95) {
             this.forceRotation(agent.id);
           }
        }
      });
      
      // Emit update to refresh UI with new resource stats
      this.emit({ type: 'agent_update' });

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