
import { amunetApi } from './AmunetAPI';

// Fix for missing Jest types
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;
declare const global: any;

// Mock fetch globally
global.fetch = jest.fn();

describe('AmunetAPI Service Unit Tests', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
    localStorage.clear();
  });

  test('Singleton initializes correctly', () => {
    expect(amunetApi).toBeDefined();
    expect(typeof amunetApi.isUsingRealBackend).toBe('function');
  });

  test('Decoy Cloud: getDecoyClusters returns mocked data', async () => {
    const clusters = await amunetApi.getDecoyClusters();
    expect(Array.isArray(clusters)).toBe(true);
    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters[0].type).toBeDefined();
  });

  test('Decoy Cloud: deployDecoy returns success', async () => {
    const result = await amunetApi.deployDecoy('Database');
    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^dc-/);
    expect(result.type).toBe('Database');
  });

  test('Decoy Cloud: purgeDecoys returns success', async () => {
    const result = await amunetApi.purgeDecoys();
    expect(result.success).toBe(true);
    expect(result.purged).toBeDefined();
  });

  test('Compliance: getComplianceControls returns data', async () => {
    const controls = await amunetApi.getComplianceControls();
    expect(Array.isArray(controls)).toBe(true);
    expect(controls[0].code).toBeDefined();
  });

  test('Compliance: getAuditLogs returns logs', async () => {
    const logs = await amunetApi.getAuditLogs();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs[0].hash).toBeDefined();
    expect(logs[0].actor).toBeDefined();
  });

  test('Compliance: getPolicies returns policies', async () => {
    const policies = await amunetApi.getPolicies();
    expect(Array.isArray(policies)).toBe(true);
    expect(policies[0].status).toBeDefined();
  });

  test('Compliance: acknowledgePolicy', async () => {
    const result = await amunetApi.acknowledgePolicy('p1', 'u1');
    expect(result).toBe(true);
  });

  test('Compliance: runComplianceTest', async () => {
    const result = await amunetApi.runComplianceTest('c1');
    expect(result.success).toBe(true);
    expect(result.status).toBe('Pass');
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
    expect(agents.length).toBeGreaterThan(0);
  });
});
