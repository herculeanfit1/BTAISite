import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavBar } from '../../app/components/NavBar';
import { Footer } from '../../app/components/Footer';

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
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.className = '';
  });

  it('integrates theme toggle with navigation and footer components', async () => {
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
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Click to switch to dark mode
    fireEvent.click(themeToggle);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    // Click again to switch back to light mode
    fireEvent.click(themeToggle);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');
    });
  });

  it('persists theme preference across component remounts', async () => {
    // Set initial theme to dark
    localStorageMock.getItem.mockReturnValue('dark');

    const { unmount } = render(<NavBar />);

    // Verify dark mode is applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Unmount and remount component
    unmount();
    render(<NavBar />);

    // Theme should still be dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    const themeToggle = screen.getByTestId('dark-mode-toggle');
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('respects system preference when no saved theme exists', () => {
    // Mock system preference for dark mode
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

    render(<NavBar />);

    // Should apply dark mode based on system preference
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
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
    expect(themeToggle).toHaveClass('h-3', 'w-3');
    
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

  it('displays correct icons for light and dark modes', async () => {
    render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');
    
    // Initially in light mode - should show moon icon
    let icon = themeToggle.querySelector('svg');
    expect(icon).toHaveClass('text-blue-600');

    // Switch to dark mode
    fireEvent.click(themeToggle);

    await waitFor(() => {
      icon = themeToggle.querySelector('svg');
      expect(icon).toHaveClass('text-yellow-500');
    });
  });

  it('navigation bar has solid background styling', () => {
    render(<NavBar />);

    const header = screen.getByRole('navigation');
    expect(header).toHaveClass('bg-white', 'dark:bg-gray-900');
    expect(header).toHaveAttribute('data-theme-bg', 'true');
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

  it('handles rapid theme switching correctly', async () => {
    render(<NavBar />);

    const themeToggle = screen.getByTestId('dark-mode-toggle');
    
    // Rapidly click multiple times
    fireEvent.click(themeToggle); // to dark
    fireEvent.click(themeToggle); // to light
    fireEvent.click(themeToggle); // to dark
    fireEvent.click(themeToggle); // to light

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('theme', 'light');
    });
  });
}); 