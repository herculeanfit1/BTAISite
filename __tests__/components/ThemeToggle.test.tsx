import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from '../../app/components/ThemeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Reset document classes
    document.documentElement.className = '';
    
    // Mock window.matchMedia to return consistent results
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders the theme toggle button', async () => {
    render(<ThemeToggle />);
    
    const button = await screen.findByTestId('dark-mode-toggle');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('starts in light mode by default', async () => {
    render(<ThemeToggle />);
    
    const button = await screen.findByTestId('dark-mode-toggle');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });

  it('respects saved theme preference from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects system preference when no saved theme', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ThemeToggle />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme when clicked', async () => {
    render(<ThemeToggle />);
    
    const button = screen.getByTestId('dark-mode-toggle');
    
    // Initially in light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Click to switch to dark mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
    
    // Click again to switch back to light mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  it('updates aria-label and title when theme changes', async () => {
    render(<ThemeToggle />);
    
    const button = screen.getByTestId('dark-mode-toggle');
    
    // Initially shows "Switch to dark mode"
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
    
    // Click to switch to dark mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });
  });

  it('has correct styling classes', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByTestId('dark-mode-toggle');
    expect(button).toHaveClass('relative', 'flex', 'h-3', 'w-3');
  });

  it('displays correct icon for light mode', () => {
    render(<ThemeToggle />);
    
    const moonIcon = screen.getByRole('button').querySelector('svg');
    expect(moonIcon).toHaveClass('text-blue-600');
  });

  it('displays correct icon for dark mode', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    const sunIcon = screen.getByRole('button').querySelector('svg');
    expect(sunIcon).toHaveClass('text-yellow-500');
  });
});
