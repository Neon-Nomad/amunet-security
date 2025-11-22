

import { AttackType, ThreatLevel, Threat, ServerNode, ZeroTrustSession, Agent, AnalyticsData } from './types';

export const LOCATIONS = [
  'Beijing, CN', 'Moscow, RU', 'Pyongyang, KP', 'Tehran, IR', 'Unknown Proxy', 'São Paulo, BR', 'London, UK'
];

export const SERVICES = [
  'Auth Gateway', 'Payment API', 'User DB', 'Admin Panel', 'Legacy CRM', 'Edge Node'
];

export const MOCK_LOGS = [
  { time: '10:42:01', msg: 'MTD Rotation initiated: Subnet 10.0.4.x' },
  { time: '10:41:55', msg: 'Deception Layer: Honeypot Alpha-9 accessed' },
  { time: '10:41:42', msg: 'AI Prediction: SQL Injection likely on /api/v1/login' },
  { time: '10:41:30', msg: 'Zero Trust: Access denied for user dev_ops_temp' },
  { time: '10:41:15', msg: 'Threat Intelligence: New CVE-2024-9921 signature updated' },
];

export const generateRandomIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

export const MOCK_ANALYTICS: AnalyticsData = {
  rotations: Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.floor(Math.random() * 50) + 20 + (i * 2) // Upward trend
  })),
  threats: Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.floor(Math.random() * 20) + 5
  })),
  uptime: Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: 99.9 + (Math.random() * 0.09)
  }))
};

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'ag-aws-01',
    hostname: 'prod-api-cluster-1',
    ip: '54.23.11.102',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'Active',
    version: 'v2.4.1',
    lastHeartbeat: Date.now(),
    rotationInterval: 60,
    activePorts: [80, 443, 8080],
    honeypotsActive: 4,
    cpuUsage: 45,
    memoryUsage: 62,
    latency: 24
  },
  {
    id: 'ag-aws-02',
    hostname: 'prod-api-cluster-2',
    ip: '54.12.44.21',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'Active',
    version: 'v2.4.1',
    lastHeartbeat: Date.now(),
    rotationInterval: 60,
    activePorts: [80, 443],
    honeypotsActive: 4,
    cpuUsage: 32,
    memoryUsage: 45,
    latency: 28
  },
  {
    id: 'ag-gcp-01',
    hostname: 'db-shard-primary',
    ip: '34.67.22.11',
    provider: 'GCP',
    region: 'europe-west3',
    status: 'Rotating',
    version: 'v2.4.0',
    lastHeartbeat: Date.now() - 1000,
    rotationInterval: 120,
    activePorts: [5432, 22],
    honeypotsActive: 2,
    cpuUsage: 78,
    memoryUsage: 85,
    latency: 45
  },
  {
    id: 'ag-onprem-01',
    hostname: 'legacy-payment-gateway',
    ip: '192.168.100.5',
    provider: 'On-Prem',
    region: 'NYC-DC',
    status: 'Active',
    version: 'v2.3.9',
    lastHeartbeat: Date.now() - 500,
    rotationInterval: 300,
    activePorts: [443],
    honeypotsActive: 10,
    cpuUsage: 12,
    memoryUsage: 24,
    latency: 5
  }
];

export const INITIAL_NODES: ServerNode[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `node-${i}`,
  name: i % 3 === 0 ? `Decoy-Srv-${i}` : `Prod-Srv-${i}`,
  ip: generateRandomIP(),
  port: 8080 + i,
  role: i % 3 === 0 ? 'Decoy' : 'Primary',
  status: 'Active',
  rotationStatus: 'Stable',
  load: Math.floor(Math.random() * 60) + 20,
}));

export const INITIAL_THREATS: Threat[] = [
  {
    id: 't-1',
    type: AttackType.SQL_INJECTION,
    sourceIp: '192.168.1.105',
    targetService: 'User DB',
    timestamp: Date.now(),
    predictionConfidence: 98,
    status: 'Trapped',
    location: 'Unknown Proxy'
  },
  {
    id: 't-2',
    type: AttackType.DDOS,
    sourceIp: '45.22.19.11',
    targetService: 'Edge Node',
    timestamp: Date.now() - 5000,
    predictionConfidence: 85,
    status: 'Predicted',
    location: 'Moscow, RU'
  }
];

export const MOCK_SESSIONS: ZeroTrustSession[] = [
  {
    id: 'sess-1',
    user: 'alice.admin@amunet.ai',
    role: 'Super Admin',
    device: 'MacBook Pro M2',
    ip: '10.0.1.42',
    location: 'San Francisco, US',
    riskScore: 12,
    status: 'Active',
    lastActive: 'Just now',
    resourceAccessed: 'Core Configuration'
  },
  {
    id: 'sess-2',
    user: 'bob.dev@amunet.ai',
    role: 'Developer',
    device: 'Linux Workstation',
    ip: '10.0.2.15',
    location: 'Berlin, DE',
    riskScore: 45,
    status: 'Challenged',
    lastActive: '2m ago',
    resourceAccessed: 'Production DB'
  },
  {
    id: 'sess-3',
    user: 'contractor.temp@agency.com',
    role: 'Contractor',
    device: 'Windows 11',
    ip: '192.168.55.2',
    location: 'Mumbai, IN',
    riskScore: 88,
    status: 'Flagged',
    lastActive: '5m ago',
    resourceAccessed: 'Payroll API'
  },
  {
    id: 'sess-4',
    user: 'system.service',
    role: 'Service Account',
    device: 'AWS Lambda',
    ip: '172.31.0.1',
    location: 'us-east-1',
    riskScore: 5,
    status: 'Active',
    lastActive: '1s ago',
    resourceAccessed: 'Log Aggregator'
  }
];