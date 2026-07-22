import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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
    // React only renders <noscript> children during server rendering — on a
    // client render jsdom reports zero child nodes — so assert against the
    // server markup, which is where the fallback actually has to appear.
    const html = renderToStaticMarkup(<HeroSection />);
    const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? "";
    expect(noscript).not.toBe("");
    expect(noscript).toContain(
      "Most AI pilots never reach production. We build the ones that do.",
    );
    expect(noscript).toContain("Book an AI Opportunity Assessment");
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
