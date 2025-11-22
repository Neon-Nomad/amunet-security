
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import { amunetApi } from './services/AmunetAPI';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;
declare const window: any;

// =============================================================================
// 1. ROBUST MOCKING OF DEPENDENCIES
// =============================================================================

// Mock API completely to ensure UI tests don't depend on internal state or network
jest.mock('./services/AmunetAPI', () => {
  const mockApi = {
    login: jest.fn(),
    setAuthToken: jest.fn(),
    isUsingRealBackend: jest.fn(() => false),
    subscribeToRealTimeEvents: jest.fn(() => () => {}),
    getAgents: jest.fn(() => Promise.resolve([
        { id: '1', hostname: 'test-node', status: 'Active', ip: '1.1.1.1', provider: 'AWS', activePorts: [80], rotationInterval: 60 }
    ])),
    getAnalytics: jest.fn(() => Promise.resolve({ 
        rotations: [{date:'Jan 1', value: 10}], 
        threats: [{date:'Jan 1', value: 2}], 
        uptime: [{date:'Jan 1', value: 99.9}] 
    })),
    triggerLockdown: jest.fn(),
    setBackendUrl: jest.fn(),
    askDocsAI: jest.fn(() => Promise.resolve("AI Help Response")),
    forceRotation: jest.fn(() => Promise.resolve()),
    isolateAgent: jest.fn(() => Promise.resolve({ success: true, agentId: '123', status: 'Isolated' })),
    whitelistIP: jest.fn(() => Promise.resolve({ success: true, ip: '1.1.1.1', ruleId: 'wl-1' })),
    blacklistIP: jest.fn(() => Promise.resolve({ success: true, ip: '1.1.1.1', ruleId: 'bl-1' })),
    createSnapshot: jest.fn(() => Promise.resolve({ id: 'snap-1', size: '10MB' })),
    rollbackConfig: jest.fn(() => Promise.resolve({ success: true, version: 'v1' })),
    exportLogs: jest.fn(() => Promise.resolve([])),
    generateReport: jest.fn(() => Promise.resolve({})),
    alertTeam: jest.fn(() => Promise.resolve({})),
    scheduleCommand: jest.fn(() => Promise.resolve({})),
    searchLogs: jest.fn(() => Promise.resolve([])),
    listSnapshots: jest.fn(() => Promise.resolve(['s1'])),
    compareSnapshots: jest.fn(() => Promise.resolve('diff')),
    listScripts: jest.fn(() => Promise.resolve([])),
    executeScript: jest.fn(() => Promise.resolve({ output: 'done' })),
    saveMacro: jest.fn(() => Promise.resolve(true)),
    getStateAt: jest.fn(() => Promise.resolve({})),
    askAI: jest.fn(() => Promise.resolve({ text: 'AI Answer', actions: [] })),
    listHistoricalAttacks: jest.fn(() => Promise.resolve(['attack-1'])),
    replayAttack: jest.fn(() => Promise.resolve(true)),
    runBenchmark: jest.fn(() => Promise.resolve({ score: 100, rotationTime: 10, detectionTime: 10 })),
    createCheckoutSession: jest.fn(() => Promise.resolve({ url: '#' })),
  };
  return { amunetApi: mockApi };
});

// Mock Framer Motion to prevent animation timing issues
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
}));

// =============================================================================
// 2. HELPER UTILITIES
// =============================================================================

const performLogin = async () => {
  (amunetApi.login as any).mockResolvedValue({
    access_token: 'valid-token',
    user: { email: 'demo@amunet.ai', id: '1', role: 'admin', companyName: 'Test Corp', plan: 'startup' }
  });
  
  // 1. Landing Page -> Click Login
  // Use getByRole for better accessibility checks (finds button even with icons)
  const loginBtn = screen.getByRole('button', { name: /Login/i });
  fireEvent.click(loginBtn); 

  // 2. Login Form Input
  const emailInput = screen.getByPlaceholderText('name@company.com');
  const passInput = screen.getByPlaceholderText('••••••••');
  
  fireEvent.change(emailInput, { target: { value: 'demo@amunet.ai' } });
  fireEvent.change(passInput, { target: { value: 'demo123' } });
  
  // 3. Submit
  await act(async () => {
    fireEvent.click(screen.getByText('Authenticate'));
  });
};

// =============================================================================
// 3. TEST SUITES
// =============================================================================

describe('Application Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Full User Journey: Landing -> Login -> Dashboard -> Logout', async () => {
    render(<App />);
    
    // A. Check Landing Page
    expect(screen.getByText(/The Last Firewall/i)).toBeInTheDocument();
    
    // B. Perform Login
    await performLogin();

    // C. Verify Dashboard Load
    await waitFor(() => {
      expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Security Score/i)).toBeInTheDocument();

    // D. Perform Logout
    const signOutBtn = screen.getByText(/Sign Out/i);
    fireEvent.click(signOutBtn);

    // E. Verify Return to Landing/Login
    await waitFor(() => {
        expect(localStorage.getItem('amunet_token')).toBeNull();
        // Should return to Landing Page
        expect(screen.getByText(/The Last Firewall/i)).toBeInTheDocument();
    });
  });

  test('Navigation switches views correctly', async () => {
    render(<App />);
    await performLogin();
    await waitFor(() => screen.getByText(/Command Center/i));

    // Switch to Threats
    fireEvent.click(screen.getByText('Threat Prediction'));
    expect(screen.getByText(/Predictive Threat Engine/i)).toBeInTheDocument();

    // Switch to MTD
    fireEvent.click(screen.getByText('Morphing Defense'));
    expect(screen.getByText(/Active Agent Topology/i)).toBeInTheDocument();

    // Switch to Settings
    fireEvent.click(screen.getByText('Configuration'));
    expect(screen.getByText(/System Configuration/i)).toBeInTheDocument();
  });

  test('Command Palette shortcut opens CLI', async () => {
    render(<App />);
    await performLogin();
    await waitFor(() => screen.getByText(/Command Center/i));

    // Press Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    expect(screen.getByText(/AMUNET_CLI_ROOT/i)).toBeInTheDocument();
  });
});

describe('Application Stress Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('STRESS: Rapid navigation does not crash app', async () => {
    render(<App />);
    await performLogin();
    await waitFor(() => screen.getByText(/Command Center/i));

    const navItems = [
        'Command Center', 
        'Threat Prediction', 
        'Morphing Defense', 
        'Deception Layer', 
        'Zero Trust Access',
        'Configuration'
    ];

    // Simulate user frantically clicking different nav items
    await act(async () => {
        for (let i = 0; i < 20; i++) { // 20 rapid switches
            const target = navItems[i % navItems.length];
            const btn = screen.getByText(target);
            fireEvent.click(btn);
            // No wait here - intentionally rapid
        }
    });

    // Should settle on the last clicked item without error
    expect(screen.getByText(/System Configuration/i)).toBeInTheDocument();
  });

  test('STRESS: Rapid Command Palette toggle', async () => {
    render(<App />);
    await performLogin();
    await waitFor(() => screen.getByText(/Command Center/i));

    // Open/Close 10 times rapidly
    for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(window, { key: 'k', metaKey: true }); // Open
        // Just checking it handles the event listener thrashing
    }
    
    // App should still be responsive
    expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
  });
});
