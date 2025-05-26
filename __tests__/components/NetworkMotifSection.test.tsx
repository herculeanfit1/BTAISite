import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom";
import { NetworkMotifSection } from '../../app/components/NetworkMotifSection';

describe("NetworkMotifSection Component", () => {
  it("renders with default props", () => {
    render(<NetworkMotifSection />);

    // Check if default title and subtitle are rendered
    expect(screen.getByText("Network of Trust")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Our technology is built on a foundation of interconnected trust and security.",
      ),
    ).toBeInTheDocument();

    // Check if all four feature cards are rendered
    expect(screen.getByText("Connected Systems")).toBeInTheDocument();
    expect(screen.getByText("Trust Framework")).toBeInTheDocument();
    expect(screen.getByText("Transparent Data Flow")).toBeInTheDocument();
    expect(screen.getByText("Secure Implementation")).toBeInTheDocument();
  });

  it("renders with custom title and subtitle", () => {
    const customTitle = "Custom Network Title";
    const customSubtitle = "Custom network subtitle text";

    render(
      <NetworkMotifSection title={customTitle} subtitle={customSubtitle} />,
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
  });

  it("applies custom className correctly", () => {
    const customClass = "test-custom-class";

    render(<NetworkMotifSection className={customClass} />);

    // Get the section element and check if it has the custom class
    const sectionElement = screen
      .getByText("Network of Trust")
      .closest("section");
    expect(sectionElement).toHaveClass(customClass);
  });

  it("renders all feature cards with their descriptions", () => {
    render(<NetworkMotifSection />);

    // Check for card titles
    const cardTitles = [
      "Connected Systems",
      "Trust Framework",
      "Transparent Data Flow",
      "Secure Implementation",
    ];

    // Check for card descriptions
    const cardDescriptions = [
      "Our solutions create a network of trust between AI and human decision-makers.",
      "We build bridges between powerful AI capabilities and human values and ethics.",
      "Clear visibility into how data is processed, used, and protected throughout the AI lifecycle.",
      "Enterprise-grade security practices built into every AI solution we deliver.",
    ];

    cardTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    cardDescriptions.forEach((description) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});
