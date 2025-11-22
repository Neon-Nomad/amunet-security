
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DecoyCloud from './DecoyCloud';
import { amunetApi } from '../services/AmunetAPI';

// Fix for missing Jest types
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const test: any;
declare const expect: any;
declare const window: any;

// Mock dependencies
jest.mock('../services/AmunetAPI', () => ({
  amunetApi: {
    getDecoyClusters: jest.fn(),
    deployDecoy: jest.fn(),
    purgeDecoys: jest.fn(),
  }
}));

jest.mock('../components/StatCard', () => {
  return function MockStatCard({ title, value }: any) {
    return <div data-testid="stat-card">{title}: {value}</div>;
  };
});

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('DecoyCloud View', () => {
  const mockDecoys = [
    { id: 'dc-1', name: 'Shadow-DB', type: 'Database', status: 'Active', attacksDiverted: 100, resourceUsage: 10, uptime: '1h', costToAttacker: 500 },
    { id: 'dc-2', name: 'Shadow-Auth', type: 'Auth Service', status: 'Compromised', attacksDiverted: 50, resourceUsage: 90, uptime: '2h', costToAttacker: 200 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (amunetApi.getDecoyClusters as any).mockResolvedValue(mockDecoys);
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    // Mock notification
    window.showNotification = jest.fn();
  });

  test('Renders initial stats and decoy list', async () => {
    await act(async () => {
      render(<DecoyCloud />);
    });

    expect(screen.getByText('Decoy Cloud')).toBeInTheDocument();
    expect(screen.getByText('Shadow-DB')).toBeInTheDocument();
    expect(screen.getByText('Shadow-Auth')).toBeInTheDocument();
    
    // Check aggregated stats
    expect(screen.getAllByTestId('stat-card')[0]).toHaveTextContent('Attacks Diverted to Decoys: 150');
  });

  test('Toggles Ghost Mode', async () => {
    await act(async () => {
      render(<DecoyCloud />);
    });

    const ghostBtn = screen.getByText(/Ghost Mode:/i);
    expect(ghostBtn).toHaveTextContent('OFF');

    fireEvent.click(ghostBtn);
    expect(ghostBtn).toHaveTextContent('ENABLED');
    
    // Visual check for invisibility text (only appears in ghost mode)
    expect(screen.getByText('INVISIBLE TO SCANNERS')).toBeInTheDocument();
  });

  test('Deploys a new decoy', async () => {
    (amunetApi.deployDecoy as any).mockResolvedValue({ success: true });
    
    await act(async () => {
      render(<DecoyCloud />);
    });

    // Open dropdown (simulated by hovering or just finding the button if visible)
    // Since the dropdown is CSS hover, we might need to simulate the click directly on the hidden element if testing library can find it, 
    // or assume the button "Deploy New Decoy" makes the list semantic.
    // For this test, we'll assume the list items are rendered but maybe hidden, or we simulate the interaction flow.
    
    // Note: React Testing Library often struggles with CSS hover states. 
    // We will simulate clicking the type button directly assuming it's in the DOM.
    const deployDbBtn = screen.getByText('Database');
    
    await act(async () => {
        fireEvent.click(deployDbBtn);
    });

    expect(amunetApi.deployDecoy).toHaveBeenCalledWith('Database');
    expect(window.showNotification).toHaveBeenCalledWith('success', 'Decoy Deployed', expect.stringContaining('Database'));
  });

  test('Purges compromised decoys', async () => {
    (amunetApi.purgeDecoys as any).mockResolvedValue({ success: true, purged: 1 });

    await act(async () => {
      render(<DecoyCloud />);
    });

    const purgeBtn = screen.getByText('Flush Compromised');
    
    await act(async () => {
        fireEvent.click(purgeBtn);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(amunetApi.purgeDecoys).toHaveBeenCalled();
    // Should remove compromised decoy from view
    expect(screen.queryByText('Shadow-Auth')).not.toBeInTheDocument();
  });
});
