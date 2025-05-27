import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom"
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from '../../app/components/ThemeToggle';
import React from "react";

// Mock the next-themes useTheme hook
const mockSetTheme = vi.fn();
let currentTheme = "light";
let resolvedTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: (theme: string) => {
      mockSetTheme(theme);
      currentTheme = theme;
      resolvedTheme = theme;
    },
    resolvedTheme: resolvedTheme,
  }),
}));

describe("Theme Switching Integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentTheme = "light";
    resolvedTheme = "light";

    // Mock document.documentElement.classList methods
    if (document.documentElement) {
      if (!vi.isMockFunction(document.documentElement.classList.add)) {
        vi.spyOn(document.documentElement.classList, 'add').mockImplementation(vi.fn());
      }
      
      if (!vi.isMockFunction(document.documentElement.classList.remove)) {
        vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(vi.fn());
      }
      
      if (!vi.isMockFunction(document.documentElement.classList.contains)) {
        vi.spyOn(document.documentElement.classList, 'contains').mockImplementation((className) => {
          if (className === "dark") {
            return resolvedTheme === "dark";
          }
          return false;
        });
      }
    }
  });

  it("renders the theme toggle button correctly", async () => {
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
      expect(themeButton).toHaveAttribute("aria-label", "Switch to dark mode");
      expect(themeButton).toHaveAttribute("data-testid", "dark-mode-toggle");
    });
  });

  it("handles component initialization gracefully", () => {
    // Test that the component renders without throwing errors
    expect(() => render(<ThemeToggle />)).not.toThrow();
    
    // Verify the component renders the theme toggle
    const themeToggle = screen.getByTestId("dark-mode-toggle");
    expect(themeToggle).toBeInTheDocument();
  });

  it("switches from light to dark theme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    // Initial theme should be light
    expect(resolvedTheme).toBe("light");

    // Click the toggle button
    const themeButton = screen.getByRole("button", {
      name: "Switch to dark mode",
    });
    await user.click(themeButton);

    // Check that the theme was changed to dark
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("switches from dark to light theme when clicked", async () => {
    // Set the initial theme to dark
    currentTheme = "dark";
    resolvedTheme = "dark";

    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    // Initial theme should be dark
    expect(resolvedTheme).toBe("dark");

    // Click the toggle button
    const themeButton = screen.getByRole("button", {
      name: "Switch to light mode",
    });
    await user.click(themeButton);

    // Check that the theme was changed to light
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("renders the appropriate icon for light theme", async () => {
    currentTheme = "light";
    resolvedTheme = "light";
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    // In light mode, we should have the moon icon visible and sun icon hidden
    const button = screen.getByRole("button");
    const svgs = button.querySelectorAll("svg");
    
    // Should have 2 SVGs (sun and moon)
    expect(svgs).toHaveLength(2);
    
    // Moon icon should be visible (opacity-100)
    const moonIcon = svgs[1]; // Second SVG is moon
    expect(moonIcon).toHaveClass("opacity-100");
    
    // Sun icon should be hidden (opacity-0)
    const sunIcon = svgs[0]; // First SVG is sun
    expect(sunIcon).toHaveClass("opacity-0");
  });

  it("renders the appropriate icon for dark theme", async () => {
    currentTheme = "dark";
    resolvedTheme = "dark";
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    // In dark mode, we should have the sun icon visible and moon icon hidden
    const button = screen.getByRole("button");
    const svgs = button.querySelectorAll("svg");
    
    // Should have 2 SVGs (sun and moon)
    expect(svgs).toHaveLength(2);
    
    // Sun icon should be visible (opacity-100)
    const sunIcon = svgs[0]; // First SVG is sun
    expect(sunIcon).toHaveClass("opacity-100");
    
    // Moon icon should be hidden (opacity-0)
    const moonIcon = svgs[1]; // Second SVG is moon
    expect(moonIcon).toHaveClass("opacity-0");
  });

  it("applies custom className correctly", async () => {
    const customClass = "custom-theme-toggle";
    render(<ThemeToggle className={customClass} />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toHaveClass(customClass);
    });
  });

  it("has proper accessibility attributes", async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toHaveAttribute("aria-label");
      expect(themeButton).toHaveAttribute("data-testid", "dark-mode-toggle");
    });
  });

  it("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    const themeButton = screen.getByRole("button");
    
    // Focus the button
    await user.tab();
    expect(themeButton).toHaveFocus();
    
    // Press Enter to activate
    await user.keyboard("{Enter}");
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("handles system theme preference", async () => {
    // Test with system theme
    currentTheme = "system";
    resolvedTheme = "dark"; // System resolves to dark
    
    render(<ThemeToggle />);

    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toHaveAttribute("aria-label", "Switch to light mode");
    });
  });
});
