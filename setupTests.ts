import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Fix for missing Jest types and globals
declare const jest: any;
declare const global: any;
declare const window: any;

// Polyfill TextEncoder/TextDecoder for JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver (used by Framer Motion)
const IntersectionObserverMock = function () {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
};
global.IntersectionObserver = IntersectionObserverMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.scrollIntoView (used in navigation)
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock URL.createObjectURL (used in Export Logs)
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

// Mock window.alert and window.confirm
window.alert = jest.fn();
window.confirm = jest.fn(() => true);
window.scrollTo = jest.fn();
