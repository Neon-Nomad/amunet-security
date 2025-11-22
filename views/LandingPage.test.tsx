import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from './LandingPage';

declare const jest: any;
declare const describe: any;
declare const test: any;
declare const expect: any;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
}));

describe('Landing Page Structure', () => {
  test('Renders main value propositions', () => {
    render(<LandingPage onLaunch={() => {}} />);
    expect(screen.getByText(/The Last Firewall/i)).toBeInTheDocument();
    expect(screen.getByText(/Moving Target Defense/i)).toBeInTheDocument();
    expect(screen.getByText(/Deception Grid/i)).toBeInTheDocument();
  });

  test('Primary CTA triggers onLaunch callback', () => {
    const handleLaunch = jest.fn();
    render(<LandingPage onLaunch={handleLaunch} />);
    
    // There are multiple "Deploy" or "Login" buttons. 
    // "Deploy Protection" is the main Hero CTA
    const heroCTA = screen.getByText(/Deploy Protection/i);
    fireEvent.click(heroCTA);
    
    expect(handleLaunch).toHaveBeenCalledTimes(1);
  });

  test('Navbar Login CTA triggers onLaunch callback', () => {
    const handleLaunch = jest.fn();
    render(<LandingPage onLaunch={handleLaunch} />);
    
    // "Login" in nav
    const navLogin = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(navLogin);
    
    expect(handleLaunch).toHaveBeenCalledTimes(1);
  });
});
