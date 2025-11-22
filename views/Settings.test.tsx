
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Settings from './Settings';
import { amunetApi } from '../services/AmunetAPI';
import { AuthProvider } from '../contexts/AuthContext';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;
declare const window: any;

jest.mock('../services/AmunetAPI', () => ({
  amunetApi: {
    isUsingRealBackend: jest.fn(() => false),
    setBackendUrl: jest.fn(),
    verifyAIConfig: jest.fn(),
    createCheckoutSession: jest.fn(),
  }
}));

// Mock Auth Context
jest.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ user: { plan: 'startup', email: 'test@test.com' } }),
    AuthProvider: ({ children }: any) => <div>{children}</div>
}));

describe('Settings View', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.showNotification = jest.fn();
  });

  test('Renders AI Configuration section', () => {
    render(<Settings />);
    expect(screen.getByText('Generative Intelligence Provider')).toBeInTheDocument();
    expect(screen.getByText('BYOK Enabled')).toBeInTheDocument();
  });

  test('Handles AI Key Verification Success', async () => {
    (amunetApi.verifyAIConfig as any).mockResolvedValue(true);
    render(<Settings />);

    const keyInput = screen.getByPlaceholderText('sk-...');
    const verifyBtn = screen.getByText('Verify & Connect');

    // Initially button disabled or no key
    expect(verifyBtn).toBeDisabled();

    fireEvent.change(keyInput, { target: { value: 'sk-test-key-123' } });
    expect(verifyBtn).not.toBeDisabled();

    await act(async () => {
        fireEvent.click(verifyBtn);
    });

    expect(amunetApi.verifyAIConfig).toHaveBeenCalledWith('gemini', 'sk-test-key-123');
    expect(window.showNotification).toHaveBeenCalledWith('success', expect.any(String), expect.any(String));
  });

  test('Handles AI Key Verification Failure', async () => {
    (amunetApi.verifyAIConfig as any).mockRejectedValue(new Error('Invalid Key'));
    render(<Settings />);

    const keyInput = screen.getByPlaceholderText('sk-...');
    const verifyBtn = screen.getByText('Verify & Connect');

    fireEvent.change(keyInput, { target: { value: 'bad-key' } });

    await act(async () => {
        fireEvent.click(verifyBtn);
    });

    expect(window.showNotification).toHaveBeenCalledWith('error', expect.any(String), expect.any(String));
  });
});
