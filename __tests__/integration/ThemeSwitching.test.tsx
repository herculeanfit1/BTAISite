import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom"
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from '../../app/components/ThemeToggle';
import React from "react";

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

describe("Theme Switching Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
  });

  it("renders the theme toggle button correctly", () => {
    render(<ThemeToggle />);

    const themeButton = screen.getByTestId("dark-mode-toggle");
    expect(themeButton).toBeInTheDocument();
    expect(themeButton).toHaveAttribute("aria-label", "Switch to dark mode");
  });

  it("handles component initialization gracefully", () => {
    expect(() => render(<ThemeToggle />)).not.toThrow();

    const themeToggle = screen.getByTestId("dark-mode-toggle");
    expect(themeToggle).toBeInTheDocument();
  });

  it("calls setTheme('dark') when clicked in light mode", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const themeButton = screen.getByTestId("dark-mode-toggle");
    await user.click(themeButton);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it("calls setTheme('light') when clicked in dark mode", async () => {
    mockTheme = 'dark';

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const themeButton = screen.getByTestId("dark-mode-toggle");
    expect(themeButton).toHaveAttribute("aria-label", "Switch to light mode");

    await user.click(themeButton);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it("renders the appropriate icon for light theme", () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId("dark-mode-toggle");
    const svg = button.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-blue-600");
  });

  it("renders the appropriate icon for dark theme", () => {
    mockTheme = 'dark';
    render(<ThemeToggle />);

    const button = screen.getByTestId("dark-mode-toggle");
    const svg = button.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("text-yellow-500");
  });

  it("applies custom className correctly", () => {
    const customClass = "custom-theme-toggle";
    render(<ThemeToggle className={customClass} />);

    const themeButton = screen.getByTestId("dark-mode-toggle");
    expect(themeButton).toHaveClass(customClass);
  });

  it("has proper accessibility attributes", () => {
    render(<ThemeToggle />);

    const themeButton = screen.getByTestId("dark-mode-toggle");
    expect(themeButton).toHaveAttribute("aria-label");
    expect(themeButton).toHaveAttribute("title");
  });

  it("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const themeButton = screen.getByTestId("dark-mode-toggle");

    themeButton.focus();
    expect(themeButton).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it("shows dark mode UI when resolvedTheme is dark", () => {
    mockTheme = 'dark';

    render(<ThemeToggle />);

    const themeButton = screen.getByTestId("dark-mode-toggle");
    expect(themeButton).toHaveAttribute("aria-label", "Switch to light mode");
  });
});
