import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom";
import { FeatureSection } from '../../app/components/FeatureSection';

describe("FeatureSection Component", () => {
  const mockFeatures = [
    {
      title: "Feature 1",
      description: "Description for feature 1",
      icon: "UserGroup",
    },
    {
      title: "Feature 2",
      description: "Description for feature 2",
      icon: "ShieldCheck",
    },
    {
      title: "Feature 3",
      description: "Description for feature 3",
      icon: "Cog",
    },
  ];

  it("renders with title and features", () => {
    render(<FeatureSection title="Our Features" features={mockFeatures} />);

    // Check for section title
    expect(screen.getByText("Our Features")).toBeInTheDocument();

    // Check for all feature titles and descriptions
    mockFeatures.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });

  it("renders with a custom subtitle when provided", () => {
    render(
      <FeatureSection
        title="Our Features"
        subtitle="Custom subtitle for features section"
        features={mockFeatures}
      />,
    );

    expect(screen.getByText("Our Features")).toBeInTheDocument();
    expect(
      screen.getByText("Custom subtitle for features section"),
    ).toBeInTheDocument();
  });

  it("renders with correct number of feature cards", () => {
    const { container } = render(
      <FeatureSection title="Our Features" features={mockFeatures} />,
    );

    // Match feature count by looking for each feature item's title
    const featureHeadings = container.querySelectorAll("h3");
    expect(featureHeadings.length).toBe(mockFeatures.length);
  });

  it("renders with custom CSS class when provided", () => {
    const { container } = render(
      <FeatureSection
        title="Our Features"
        features={mockFeatures}
        className="custom-feature-section"
      />,
    );

    // Check if the custom class is included in the section's classes
    const sectionElement = container.querySelector("section");
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement?.className).toContain("custom-feature-section");
  });

  it("renders with alternative layout when specified", () => {
    const { container } = render(
      <FeatureSection
        title="Our Features"
        features={mockFeatures}
        layout="alternate"
      />,
    );

    // The feature grid should have some special arrangement for alternate layout
    const gridElement = container.querySelector(".grid");
    expect(gridElement).toBeInTheDocument();
  });
});
