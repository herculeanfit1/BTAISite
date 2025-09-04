import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Footer } from '../../app/components/Footer';

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => {
      return <a href={href} {...props}>{children}</a>;
    }
  };
});

describe('Footer', () => {
  beforeEach(() => {
    // Mock Date.getFullYear to return a consistent year for testing
    vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the footer component', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('displays the Quick Links heading', () => {
    render(<Footer />);
    
    const heading = screen.getByText('Quick Links');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3');
  });

  it('has correct padding classes for increased top padding', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('pt-24'); // 6rem top padding
    expect(footer).toHaveClass('pb-16'); // 4rem bottom padding
    expect(footer).not.toHaveClass('py-16'); // Should not have equal padding
  });

  it('renders all navigation links', () => {
    render(<Footer />);
    
    const aboutLink = screen.getByRole('link', { name: 'About' });
    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    const termsLink = screen.getByRole('link', { name: 'Terms' });

    expect(aboutLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
  });

  it('has correct href attributes for navigation links', () => {
    render(<Footer />);
    
    const aboutLink = screen.getByRole('link', { name: 'About' });
    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    const termsLink = screen.getByRole('link', { name: 'Terms' });

    expect(aboutLink).toHaveAttribute('href', '/#about');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('displays the copyright text with current year', () => {
    render(<Footer />);
    
    const copyrightText = screen.getByText(/© 2024 Bridging Trust AI. All rights reserved./);
    expect(copyrightText).toBeInTheDocument();
  });

  it('has proper styling for the Quick Links heading', () => {
    render(<Footer />);
    
    const heading = screen.getByText('Quick Links');
    expect(heading).toHaveClass('relative', 'mb-8', 'pb-2', 'text-2xl', 'font-semibold', 'text-gray-800');
  });

  it('includes the blue underline accent for Quick Links heading', () => {
    render(<Footer />);
    
    const heading = screen.getByText('Quick Links');
    const underline = heading.querySelector('span');
    
    expect(underline).toBeInTheDocument();
    expect(underline).toHaveClass('absolute', 'bottom-0', 'left-1/2', 'h-0.5', 'w-10', '-translate-x-1/2', 'bg-[#5B90B0]');
  });

  it('has proper background color', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-gray-50');
  });

  it('has proper container structure', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    const container = footer.querySelector('.container');
    
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'max-w-5xl', 'px-6');
  });

  it('has proper spacing between navigation links', () => {
    render(<Footer />);
    
    const linksContainer = screen.getByText('About').closest('.flex');
    expect(linksContainer).toHaveClass('mb-16', 'flex', 'flex-row', 'items-center', 'justify-center', 'space-x-8');
  });

  it('includes horizontal divider', () => {
    render(<Footer />);
    
    const divider = screen.getByRole('contentinfo').querySelector('.border-t-2');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveClass('mx-auto', 'w-1/2', 'border-t-2', 'border-gray-200');
  });

  it('has proper gradient styling for copyright text', () => {
    render(<Footer />);
    
    const copyrightText = screen.getByText(/© 2024 Bridging Trust AI. All rights reserved./);
    
    // Check if the element has the gradient background style
    expect(copyrightText).toHaveStyle({
      background: 'linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%)',
      fontWeight: '500'
    });
    
    // Check webkit properties separately as they might not be supported in test environment
    const element = copyrightText as HTMLElement;
    expect(element.style.WebkitBackgroundClip || element.style.backgroundClip).toBe('text');
    expect(element.style.WebkitTextFillColor).toBe('transparent');
  });

  it('has hover effects on navigation links', () => {
    render(<Footer />);
    
    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(aboutLink).toHaveClass('transition-colors', 'hover:text-[#5B90B0]');
  });

  it('maintains proper accessibility with semantic HTML', () => {
    render(<Footer />);
    
    // Footer should be a contentinfo landmark
    const footer = screen.getByRole('contentinfo');
    expect(footer.tagName).toBe('FOOTER');
    
    // Links should be properly accessible
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
  });
}); 