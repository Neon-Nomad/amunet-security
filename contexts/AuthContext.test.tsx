
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { amunetApi } from '../services/AmunetAPI';

// Fix for missing Jest types
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;

// Mock the API singleton
jest.mock('../services/AmunetAPI', () => ({
  amunetApi: {
    login: jest.fn(),
    setAuthToken: jest.fn(),
    isUsingRealBackend: jest.fn(() => false),
    subscribeToRealTimeEvents: jest.fn(() => () => {})
  }
}));

const TestComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Guest'}</div>
      <div data-testid="user-email">{user?.email || 'No User'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Initial state is unauthenticated', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
  });

  test('Successful login updates context and localStorage', async () => {
    const mockUser = { email: 'test@test.com', id: '1', role: 'admin' };
    (amunetApi.login as any).mockResolvedValue({
      access_token: 'fake-jwt-token',
      user: mockUser
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    // Assert Context Updated
    await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@test.com');
    });

    // Assert LocalStorage Persisted
    expect(localStorage.getItem('amunet_token')).toBe('fake-jwt-token');
  });

  test('Logout clears context and localStorage', async () => {
    // Pre-seed authenticated state
    localStorage.setItem('amunet_token', 'fake-token');
    localStorage.setItem('amunet_user', JSON.stringify({ email: 'test@test.com' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify initial load from storage
    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated'));

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    expect(localStorage.getItem('amunet_token')).toBeNull();
  });
});
