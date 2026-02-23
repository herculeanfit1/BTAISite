import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from '../../app/components/ThemeToggle';

// Track theme state for mock
let mockTheme = 'light';
const mockSetTheme = vi.fn((theme: string) => {
  mockTheme = theme;
});

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockTheme,
    setTheme: mockSetTheme,
    theme: mockTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('dark-mode-toggle');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('starts in light mode by default', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('dark-mode-toggle');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });

  it('shows dark mode UI when resolvedTheme is dark', () => {
    mockTheme = 'dark';

    render(<ThemeToggle />);

    const button = screen.getByTestId('dark-mode-toggle');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('calls setTheme when clicked', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('dark-mode-toggle');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme("light") when in dark mode and clicked', () => {
    mockTheme = 'dark';

    render(<ThemeToggle />);

    const button = screen.getByTestId('dark-mode-toggle');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('updates aria-label and title based on theme', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('dark-mode-toggle');

    // Light mode shows "Switch to dark mode"
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });

  it('has correct styling classes', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('dark-mode-toggle');
    expect(button).toHaveClass('relative', 'flex', 'h-4', 'w-4');
  });

  it('displays moon icon in light mode', () => {
    render(<ThemeToggle />);

    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('text-blue-600');
  });

  it('displays sun icon in dark mode', () => {
    mockTheme = 'dark';

    render(<ThemeToggle />);

    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('text-yellow-500');
  });
});
