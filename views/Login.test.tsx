
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';
import { AuthProvider } from '../contexts/AuthContext';
import { amunetApi } from '../services/AmunetAPI';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;

jest.mock('../services/AmunetAPI', () => ({
    amunetApi: {
        login: jest.fn(),
        setAuthToken: jest.fn(),
        isUsingRealBackend: jest.fn(() => false),
        subscribeToRealTimeEvents: jest.fn(() => () => {})
    }
}));

const renderLogin = (props = {}) => {
  return render(
    <AuthProvider>
      <Login {...props} />
    </AuthProvider>
  );
};

describe('Login Component View', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders login form correct fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Authenticate')).toBeInTheDocument();
  });

  test('Handles API error gracefully', async () => {
    (amunetApi.login as any).mockRejectedValue(new Error('Invalid credentials'));

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'fail@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'failpass' } });
    
    fireEvent.click(screen.getByText('Authenticate'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('Submits with valid data', async () => {
    (amunetApi.login as any).mockResolvedValue({ access_token: 't', user: {} });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'demo@amunet.ai' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'demo123' } });
    
    fireEvent.click(screen.getByText('Authenticate'));

    await waitFor(() => {
        expect(amunetApi.login).toHaveBeenCalledWith('demo@amunet.ai', 'demo123');
    });
  });
});
