

export enum AttackType {
  DDOS = 'DDoS',
  SQL_INJECTION = 'SQL Injection',
  RANSOMWARE = 'Ransomware',
  PORT_SCAN = 'Port Scan',
  ZERO_DAY = 'Zero Day Attempt',
  PHISHING = 'Phishing Vector'
}

export enum ThreatLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  role: 'admin' | 'viewer' | 'auditor';
  plan: 'free' | 'startup' | 'enterprise';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Threat {
  id: string;
  type: AttackType;
  sourceIp: string;
  targetService: string;
  timestamp: number;
  predictionConfidence: number; // 0-100
  status: 'Predicted' | 'Blocked' | 'Trapped';
  location: string;
}

export interface Agent {
  id: string;
  hostname: string;
  ip: string;
  provider: 'AWS' | 'GCP' | 'Azure' | 'On-Prem';
  region: string;
  status: 'Active' | 'Disconnected' | 'Rotating' | 'Updating';
  version: string;
  lastHeartbeat: number;
  rotationInterval: number;
  activePorts: number[];
  honeypotsActive: number;
  // Health Metrics
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  latency: number; // ms
}

export interface ServerNode {
  id: string;
  name: string;
  ip: string;
  port: number;
  role: 'Primary' | 'Decoy' | 'Balancer';
  status: 'Active' | 'Morphing' | 'Compromised';
  rotationStatus: 'Stable' | 'Rotating' | 'Error';
  load: number;
}

export interface DecoyCluster {
  id: string;
  name: string;
  type: 'Database' | 'Web Server' | 'Auth Service' | 'Kubernetes Cluster';
  status: 'Provisioning' | 'Active' | 'Under Attack' | 'Compromised';
  attacksDiverted: number;
  resourceUsage: number; // % CPU
  uptime: string;
  costToAttacker: number; // Estimated $ wasted
}

export interface DeceptionStats {
  activeHoneypots: number;
  trappedAttackers: number;
  honeyTokensTriggered: number;
  intelligenceGathered: number; // in MB
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  networkLoad: number;
  mtdRotationTimer: number; // seconds until next morph
  activeThreats: number;
}

export interface ZeroTrustSession {
  id: string;
  user: string;
  role: string;
  device: string;
  ip: string;
  location: string;
  riskScore: number; // 0-100
  status: 'Active' | 'Flagged' | 'Challenged' | 'Terminated';
  lastActive: string;
  resourceAccessed: string;
}

export interface SystemSettings {
  mtdInterval: number;
  autoPatching: boolean;
  sensitivity: 'Low' | 'Medium' | 'High';
  notifications: boolean;
  darkWebScanning: boolean;
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsData {
  rotations: AnalyticsDataPoint[];
  threats: AnalyticsDataPoint[];
  uptime: AnalyticsDataPoint[];
}

// --- COMPLIANCE & AUDIT ---

export interface ComplianceControl {
  id: string;
  code: string; // e.g., CC6.1
  name: string;
  description: string;
  category: 'Security' | 'Availability' | 'Confidentiality' | 'Processing Integrity' | 'Privacy';
  status: 'Pass' | 'Fail' | 'Warning';
  lastChecked: string;
  evidenceCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    email: string;
    role: string;
    ip: string;
  };
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
  hash: string; // Immutable checksum
  metadata?: any;
}

export interface Policy {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  status: 'Active' | 'Draft' | 'Review';
  acknowledged: boolean;
  category: 'Access' | 'Incident' | 'Data' | 'Vendor';
  content?: string;
}