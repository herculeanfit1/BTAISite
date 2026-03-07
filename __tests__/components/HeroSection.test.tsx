import { render } from "@testing-library/react";
import { vi } from "vitest";

// Mock next/dynamic to render nothing (dynamic imports tested via E2E)
vi.mock("next/dynamic", () => ({
  default: () => {
    return function DynamicStub() {
      return null;
    };
  },
}));

import { HeroSection } from "../../app/components/home/HeroSection";

describe("HeroSection Component", () => {
  it("renders the hero section element", () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("renders the noscript fallback with headline", () => {
    const { container } = render(<HeroSection />);
    const noscript = container.querySelector("noscript");
    expect(noscript).toBeInTheDocument();
  });

  it("has the aurora background class", () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector("section");
    expect(section?.classList.contains("hero-aurora")).toBe(true);
  });

  it("renders with proper responsive classes", () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector("section");
    expect(section?.classList.contains("min-h-screen")).toBe(true);
    expect(section?.classList.contains("overflow-hidden")).toBe(true);
  });
});
