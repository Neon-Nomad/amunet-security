
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Compliance from './Compliance';
import { amunetApi } from '../services/AmunetAPI';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;
declare const window: any;

jest.mock('../services/AmunetAPI', () => ({
  amunetApi: {
    getComplianceControls: jest.fn(),
    getAuditLogs: jest.fn(),
    getPolicies: jest.fn(),
    exportAuditPackage: jest.fn(),
    runComplianceTest: jest.fn(),
    acknowledgePolicy: jest.fn(),
  }
}));

jest.mock('../components/StatCard', () => {
  return function MockStatCard({ title, value }: any) {
    return <div data-testid="stat-card">{title}: {value}</div>;
  };
});

describe('Compliance View', () => {
  const mockControls = [
    { id: '1', code: 'CC6.1', name: 'Access Security', status: 'Pass', evidenceCount: 5, description: 'MFA enforced' }
  ];
  const mockLogs = [
    { id: 'l1', timestamp: new Date().toISOString(), actor: { email: 'test@user.com', role: 'Admin', ip: '1.1.1.1' }, action: 'Login', hash: 'abc', resource: 'auth-service', status: 'success' }
  ];
  const mockPolicies = [
    { id: 'p1', title: 'Security Policy', version: 'v1', acknowledged: false, lastUpdated: '2024-01-01' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (amunetApi.getComplianceControls as any).mockResolvedValue(mockControls);
    (amunetApi.getAuditLogs as any).mockResolvedValue(mockLogs);
    (amunetApi.getPolicies as any).mockResolvedValue(mockPolicies);
    window.showNotification = jest.fn();
  });

  test('Renders Dashboard with Stats', async () => {
    await act(async () => {
      render(<Compliance />);
    });
    expect(screen.getByText('SOC 2 Compliance Center')).toBeInTheDocument();
    expect(screen.getAllByTestId('stat-card')[0]).toHaveTextContent('Security (CC6): 12/12');
    expect(screen.getByText('Access Security')).toBeInTheDocument();
    expect(screen.getByText('CC6.1')).toBeInTheDocument();
  });

  test('Exports Evidence Package', async () => {
    await act(async () => {
      render(<Compliance />);
    });
    
    const exportBtn = screen.getByText('Export Evidence Package');
    fireEvent.click(exportBtn);

    await waitFor(() => {
        expect(amunetApi.exportAuditPackage).toHaveBeenCalledWith('SOC2');
        expect(window.showNotification).toHaveBeenCalledWith('success', expect.any(String), expect.any(String));
    });
  });

  test('Runs Control Test', async () => {
    await act(async () => {
        render(<Compliance />);
    });

    // Find play button (Run Manual Test)
    const playBtns = screen.getAllByTitle('Run Manual Test');
    fireEvent.click(playBtns[0]);

    await waitFor(() => {
        expect(amunetApi.runComplianceTest).toHaveBeenCalledWith('1');
        expect(window.showNotification).toHaveBeenCalledWith('success', expect.any(String), expect.any(String));
    });
  });

  test('Switches to Logs Tab', async () => {
    await act(async () => {
      render(<Compliance />);
    });

    fireEvent.click(screen.getByText('logs'));
    expect(screen.getByText('Immutable Audit Trail')).toBeInTheDocument();
    expect(screen.getByText('test@user.com')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('Acknowledges Policy', async () => {
    await act(async () => {
      render(<Compliance />);
    });

    fireEvent.click(screen.getByText('policies'));
    expect(screen.getByText('Security Policy')).toBeInTheDocument();
    
    const ackBtn = screen.getByText('Acknowledge');
    fireEvent.click(ackBtn);

    await waitFor(() => {
        expect(amunetApi.acknowledgePolicy).toHaveBeenCalledWith('p1', expect.any(String));
        expect(window.showNotification).toHaveBeenCalled();
    });
  });
});
