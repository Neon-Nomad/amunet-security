import { amunetApi } from './SentinelAPI';

// Fix for missing Jest types
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;
declare const global: any;

// Mock fetch globally
global.fetch = jest.fn();

describe('SentinelAPI Service Unit Tests', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
    localStorage.clear();
  });

  test('Singleton initializes correctly', () => {
    expect(amunetApi).toBeDefined();
    // Should default to simulation if fetch hasn't verified backend yet
    expect(typeof amunetApi.isUsingRealBackend).toBe('function');
  });

  test('Login fallback to simulation works', async () => {
    // Force fetch to fail to ensure we hit the simulation path
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    // Test correct credentials
    const response = await amunetApi.login('demo@amunet.ai', 'demo123');
    expect(response.access_token).toBeDefined();
    expect(response.user.email).toBe('demo@amunet.ai');
    
    // Test incorrect credentials
    await expect(amunetApi.login('bad@user.com', 'wrongpass')).rejects.toThrow('Invalid credentials');
  });

  test('CLI Command: blacklistIP returns correct structure', async () => {
    const result = await amunetApi.blacklistIP('10.0.0.1');
    expect(result.success).toBe(true);
    expect(result.ip).toBe('10.0.0.1');
    expect(result.ruleId).toMatch(/^bl-/);
  });

  test('CLI Command: askAI returns mocked intelligence', async () => {
    const result = await amunetApi.askAI('Analyze current threats');
    expect(result.text).toBeDefined();
    expect(Array.isArray(result.actions)).toBe(true);
  });

  test('Agents retrieval returns array', async () => {
    const agents = await amunetApi.getAgents();
    expect(Array.isArray(agents)).toBe(true);
    // Default mock agents
    expect(agents.length).toBeGreaterThan(0);
  });

  test('Snapshot creation returns metadata', async () => {
    const snapshot = await amunetApi.createSnapshot();
    expect(snapshot.id).toMatch(/^snap-/);
    expect(snapshot.size).toBeDefined();
  });
});
