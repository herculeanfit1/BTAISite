import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom"
import { waitFor } from "@testing-library/dom";
import { NavBar } from '../../app/components/NavBar';

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, className }: any) => {
    return (
      <img src={src} alt={alt} className={className} data-testid="nav-logo" />
    );
  },
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      services: "Solutions",
      about: "About",
      contact: "Contact",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/",
    route: "/",
    asPath: "/",
    query: {},
  }),
}));

describe("NavBar Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock window.matchMedia for theme detection
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
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
  });

  it("renders the navigation bar with logo", async () => {
    render(<NavBar />);

    // Wait for the component to be fully rendered
    await waitFor(() => {
      // Use getByRole to find the navigation element instead of document.querySelector
      const navElement = screen.getByRole("navigation", { hidden: true });
      expect(navElement).toBeInTheDocument();
    });
  });

  it("displays navigation links on desktop", () => {
    render(<NavBar />);

    // Check for navigation links
    expect(screen.getByText("Solutions")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders navigation links correctly", () => {
    render(<NavBar />);

    // Check for navigation links
    expect(screen.getByRole('link', { name: 'Solutions' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it("toggles mobile menu when hamburger button is clicked", () => {
    // Set viewport width to mobile
    window.innerWidth = 640;

    render(<NavBar />);

    // Find and click the hamburger button (using aria-label "Toggle menu")
    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);

    // Check if mobile menu is visible after click
    // Use getAllByRole instead of document.querySelector
    const mobileMenuItems = screen.getAllByText(
      /(Solutions|About|Contact)/,
    );
    expect(mobileMenuItems.length).toBeGreaterThanOrEqual(3);

    // Click again to close
    fireEvent.click(menuButton);
  });
});
