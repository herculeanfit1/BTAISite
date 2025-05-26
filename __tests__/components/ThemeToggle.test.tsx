import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom";
import { ThemeToggle } from '../../app/components/ThemeToggle';

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
    const themeButton = screen.getByLabelText("Switch to dark mode");
    expect(themeButton).toBeInTheDocument();
  });

  it("toggles theme from light to dark when clicked", () => {
    render(<ThemeToggle />);

    // Click the button to toggle from light to dark
    const themeButton = screen.getByLabelText("Switch to dark mode");
    fireEvent.click(themeButton);

    // Check if setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("accepts and applies className prop", () => {
    render(<ThemeToggle className="custom-class" />);

    // Check if button has the custom class
    const button = screen.getByLabelText("Switch to dark mode");
    expect(button).toHaveClass("custom-class");
  });
});
