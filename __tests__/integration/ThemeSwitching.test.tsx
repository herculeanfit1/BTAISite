import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom"
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from '../../app/components/ThemeToggle';

// Mock the next-themes useTheme hook
const mockSetTheme = vi.fn();
let currentTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: (theme: string) => {
      mockSetTheme(theme);
      currentTheme = theme;
    },
  }),
}));

describe("Theme Switching Integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentTheme = "light"; // Reset theme to light before each test

    // Mock document.documentElement.classList methods - use separate mocks for each method
    // This avoids "Cannot redefine property: classList" errors
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
            return currentTheme === "dark";
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
    });
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
    expect(currentTheme).toBe("light");

    // Click the toggle button
    const themeButton = screen.getByRole("button", {
      name: "Switch to dark mode",
    });
    await user.click(themeButton);

    // Check that the theme was changed to dark
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
    expect(currentTheme).toBe("dark");
  });

  it("switches from dark to light theme when clicked", async () => {
    // Set the initial theme to dark
    currentTheme = "dark";

    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    // Initial theme should be dark
    expect(currentTheme).toBe("dark");

    // Click the toggle button
    const themeButton = screen.getByRole("button", {
      name: "Switch to light mode",
    });
    await user.click(themeButton);

    // Check that the theme was changed to light
    expect(mockSetTheme).toHaveBeenCalledWith("light");
    expect(currentTheme).toBe("light");
  });

  it("renders the appropriate icon for light theme", async () => {
    currentTheme = "light";
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    // In light mode, we should have the moon icon
    const moonSvg = screen.getByRole("button").querySelector("svg");
    expect(moonSvg).toHaveClass("text-gray-700");
  });

  it("renders the appropriate icon for dark theme", async () => {
    currentTheme = "dark";
    render(<ThemeToggle />);

    // Wait for component to be mounted
    await waitFor(() => {
      const themeButton = screen.getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    // In dark mode, we should have the sun icon
    const sunSvg = screen.getByRole("button").querySelector("svg");
    expect(sunSvg).toHaveClass("text-yellow-500");
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
});
