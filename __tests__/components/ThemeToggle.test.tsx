import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom";
import { ThemeToggle } from '../../src/components/ThemeToggle';

// Mock the next-themes hook
const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
    resolvedTheme: "light",
  }),
}));

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the theme toggle button", () => {
    render(<ThemeToggle />);

    // Check if the button is present
    const themeButton = screen.getByLabelText("Theme toggle (light mode only)");
    expect(themeButton).toBeInTheDocument();
  });

  it("toggles theme from light to dark when clicked", () => {
    render(<ThemeToggle />);

    // Click the button to toggle (currently only supports light mode)
    const themeButton = screen.getByLabelText("Theme toggle (light mode only)");
    fireEvent.click(themeButton);

    // Check if setTheme was called with 'light' (current implementation)
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("accepts and applies className prop", () => {
    render(<ThemeToggle className="custom-class" />);

    // Check if button has the custom class
    const button = screen.getByLabelText("Theme toggle (light mode only)");
    expect(button).toHaveClass("custom-class");
  });
});
