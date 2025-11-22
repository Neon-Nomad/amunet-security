
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';
import { amunetApi } from '../services/AmunetAPI';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;

// Robust mock for Command Palette operations
jest.mock('../services/AmunetAPI', () => ({
    amunetApi: {
        askDocsAI: jest.fn().mockResolvedValue("AI Answer"),
        getAgents: jest.fn().mockResolvedValue([]),
        forceRotation: jest.fn(),
        triggerLockdown: jest.fn(),
        askAI: jest.fn().mockResolvedValue({ text: 'Analysis Complete', actions: [] }),
        blacklistIP: jest.fn().mockResolvedValue({ success: true, ip: '1.1.1.1', ruleId: 'bl-01' }),
        verifyAIConfig: jest.fn().mockResolvedValue(true),
        explainAction: jest.fn().mockResolvedValue({ action: 'Test Action', reasoning: [], outcome: 'Test Outcome' }),
        generatePlaybook: jest.fn().mockResolvedValue({ title: 'Test Playbook', steps: [], macro: 'test_macro' }),
        getHoneypotLogs: jest.fn().mockResolvedValue([]),
        deployDecoy: jest.fn().mockResolvedValue({ success: true, id: 'dc-test' }),
        getComplianceControls: jest.fn().mockResolvedValue([
            { id: '1', code: 'CC6.1', name: 'Test Control', status: 'Pass' }
        ]),
        exportAuditPackage: jest.fn().mockResolvedValue({ url: 'http://test.com/download' }),
        getPolicies: jest.fn().mockResolvedValue([
            { id: 'p1', title: 'Test Policy', version: 'v1', acknowledged: false }
        ]),
        getAuditLogs: jest.fn().mockResolvedValue([]),
        isolateAgent: jest.fn().mockResolvedValue({ success: true, agentId: 'ag-1', status: 'Isolated' }),
        whitelistIP: jest.fn().mockResolvedValue({ success: true, ip: '1.2.3.4', ruleId: 'wl-1' }),
    }
}));

describe('CommandPalette Logic', () => {
  const handleClose = jest.fn();
  const handleLockdown = jest.fn();
  const handleSentinelMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders active shell when open', () => {
    render(<CommandPalette isOpen={true} onClose={handleClose} onLockdown={handleLockdown} onSentinelMode={handleSentinelMode} />);
    expect(screen.getByText(/AMUNET_CLI_ROOT/i)).toBeInTheDocument();
  });

  test('Processes "ghost" command', async () => {
    render(<CommandPalette isOpen={true} onClose={handleClose} onLockdown={handleLockdown} onSentinelMode={handleSentinelMode} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'ghost' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Port Obfuscation Protocol/i)).toBeInTheDocument();
    });
  });

  test('Processes "decoy deploy" command', async () => {
    render(<CommandPalette isOpen={true} onClose={handleClose} onLockdown={handleLockdown} onSentinelMode={handleSentinelMode} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'decoy deploy Database' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(amunetApi.deployDecoy).toHaveBeenCalledWith('Database');
      expect(screen.getByText(/Decoy Cluster dc-test active/i)).toBeInTheDocument();
    });
  });

  test('Processes "lockdown" command', async () => {
    render(<CommandPalette isOpen={true} onClose={handleClose} onLockdown={handleLockdown} onSentinelMode={handleSentinelMode} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'lockdown' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(handleLockdown).toHaveBeenCalledWith(true);
      expect(amunetApi.triggerLockdown).toHaveBeenCalled();
    });
  });

  test('Processes "audit --show controls" command', async () => {
      render(<CommandPalette isOpen={true} onClose={handleClose} onLockdown={handleLockdown} onSentinelMode={handleSentinelMode} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'audit --show controls' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
          expect(amunetApi.getComplianceControls).toHaveBeenCalled();
          expect(screen.getByText(/Test Control/i)).toBeInTheDocument();
      });
  });

  test('Processes "audit --export" command', async () => {
      render(<CommandPalette isOpen={true} onClose={handleClose} onLockdown={handleLockdown} onSentinelMode={handleSentinelMode} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'audit --export' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
          expect(amunetApi.exportAuditPackage).toHaveBeenCalledWith('SOC2');
          expect(screen.getByText(/Evidence Package downloaded/i)).toBeInTheDocument();
      });
  });

  test('Processes "policy --list" command', async () => {
      render(<CommandPalette isOpen={true} onClose={handleClose} onLockdown={handleLockdown} onSentinelMode={handleSentinelMode} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'policy --list' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
          expect(amunetApi.getPolicies).toHaveBeenCalled();
          expect(screen.getByText(/Test Policy/i)).toBeInTheDocument();
      });
  });
});
