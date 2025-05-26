import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom";
import { Button } from '../../app/components/Button';

describe("Button Component", () => {
  it("renders with the correct text", () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    const button = screen.getByText("Clickable");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders a primary button by default", () => {
    render(<Button>Primary Button</Button>);

    const button = screen.getByText("Primary Button");
    expect(button).toHaveClass("bg-primary");
  });

  it("renders a secondary button when variant is secondary", () => {
    render(<Button variant="secondary">Secondary Button</Button>);

    const button = screen.getByText("Secondary Button");
    expect(button).toHaveClass("bg-white");
    expect(button).toHaveClass("text-gray-800");
  });

  it("renders an outline button when variant is outline", () => {
    render(<Button variant="outline">Outline Button</Button>);

    const button = screen.getByText("Outline Button");
    expect(button).toHaveClass("bg-transparent");
    expect(button).toHaveClass("border-primary/60");
  });

  it("renders an accent button when variant is accent", () => {
    render(<Button variant="accent">Accent Button</Button>);

    const button = screen.getByText("Accent Button");
    expect(button).toHaveClass("bg-accent");
    expect(button).toHaveClass("text-white");
  });

  it("renders a link when href is provided", () => {
    render(<Button href="/test-link">Link Button</Button>);

    const linkButton = screen.getByText("Link Button");
    expect(linkButton.tagName.toLowerCase()).toBe("a");
    expect(linkButton).toHaveAttribute("href", "/test-link");
  });

  it("applies custom className correctly", () => {
    render(<Button className="custom-class">Custom Class Button</Button>);

    const button = screen.getByText("Custom Class Button");
    expect(button).toHaveClass("custom-class");
  });

  it("applies different sizes correctly", () => {
    render(<Button size="sm">Small Button</Button>);
    const smallButton = screen.getByText("Small Button");
    expect(smallButton).toHaveClass("text-xs");

    render(<Button size="lg">Large Button</Button>);
    const largeButton = screen.getByText("Large Button");
    expect(largeButton).toHaveClass("text-base");
  });

  it("renders with an icon when provided", () => {
    const icon = <span data-testid="test-icon">🔍</span>;

    render(<Button icon={icon}>Button With Icon</Button>);

    const button = screen.getByText("Button With Icon");
    const iconElement = screen.getByTestId("test-icon");

    expect(iconElement).toBeInTheDocument();
    expect(button).toContainElement(iconElement);
  });
});
