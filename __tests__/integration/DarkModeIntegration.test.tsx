import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavBar } from '../../app/components/NavBar';
import { Footer } from '../../app/components/Footer';

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

// Mock Next.js components
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => {
      return <a href={href} {...props}>{children}</a>;
    }
  };
});

vi.mock('next/image', () => {
  return {
    default: ({ src, alt, ...props }: any) => {
      return <img src={src} alt={alt} {...props} />;
    }
  };
});

describe('Dark Mode Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
  });

  it('integrates theme toggle with navigation and footer components', () => {
    const TestApp = () => (
      <div>
        <NavBar />
        <main>
          <h1>Test Content</h1>
        </main>
        <Footer />
      </div>
    );

    render(<TestApp />);

    // Find the theme toggle button
    const themeToggle = screen.getByTestId('dark-mode-toggle');
    expect(themeToggle).toBeInTheDocument();

    // Initially in light mode
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Click to switch to dark mode
    fireEvent.click(themeToggle);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('persists theme preference across component remounts', () => {
    mockTheme = 'dark';

    const { unmount } = render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');

    // Unmount and remount component
    unmount();
    render(<NavBar />);

    // Theme should still be dark
    const newToggle = screen.getByTestId('dark-mode-toggle');
    expect(newToggle).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('shows dark mode UI when resolvedTheme is dark', () => {
    mockTheme = 'dark';

    render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('theme toggle is positioned correctly in navigation', () => {
    render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');
    const toggleContainer = themeToggle.closest('.absolute');

    expect(toggleContainer).toHaveClass('top-2', 'left-2', 'z-[1001]');
  });

  it('theme toggle has correct size and styling', () => {
    render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');

    // Check size classes
    expect(themeToggle).toHaveClass('h-4', 'w-4');

    // Check styling classes
    expect(themeToggle).toHaveClass(
      'relative',
      'flex',
      'items-center',
      'justify-center',
      'rounded-full',
      'transition-all',
      'duration-200'
    );
  });

  it('displays correct icons for light and dark modes', () => {
    render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');

    const icon = themeToggle.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon?.classList.contains('h-2.5')).toBe(true);
    expect(icon?.classList.contains('w-2.5')).toBe(true);
  });

  it('navigation bar has solid background styling', () => {
    render(<NavBar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-white', 'dark:bg-gray-900');
    expect(nav).toHaveAttribute('data-theme-bg', 'true');
  });

  it('footer maintains proper styling and spacing', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');

    // Check increased top padding
    expect(footer).toHaveClass('pt-24', 'pb-16');
    expect(footer).not.toHaveClass('py-16');

    // Check Quick Links section
    const quickLinksHeading = screen.getByText('Quick Links');
    expect(quickLinksHeading).toBeInTheDocument();

    // Check navigation links
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
  });

  it('handles rapid theme switching correctly', () => {
    render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');

    // Rapidly click multiple times
    fireEvent.click(themeToggle);
    fireEvent.click(themeToggle);
    fireEvent.click(themeToggle);
    fireEvent.click(themeToggle);

    // Should have been called 4 times
    expect(mockSetTheme).toHaveBeenCalledTimes(4);
    // Should be functional after rapid clicking
    expect(themeToggle).toBeInTheDocument();
  });
});
