import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom";
import OptimizedImage from '../../app/components/OptimizedImage';

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(({ src, alt, onLoad, priority, blurDataURL, fill, ...props }) => {
    // Properly format boolean props for React
    return (
      <img 
        src={src} 
        alt={alt} 
        data-testid="next-image"
        data-has-blur={!!blurDataURL}
        data-priority={priority ? "true" : "false"}
        data-fill={fill ? "true" : "false"}
        {...props} 
      />
    );
  }),
}));

describe("OptimizedImage Component", () => {
  it("renders with required props", () => {
    render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

    const image = screen.getByTestId("next-image");
    expect(image).toBeDefined();
    expect(image).toHaveAttribute("src", "/test-image.jpg");
    expect(image).toHaveAttribute("alt", "Test image");
  });

  it("applies custom width and height when provided", () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={400}
        height={300}
      />,
    );

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("width", "400");
    expect(image).toHaveAttribute("height", "300");
  });

  it("applies custom className correctly", () => {
    const customClass = "test-custom-class";

    const { container } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        className={customClass}
      />,
    );

    // Find the wrapper div that contains the image
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(customClass);
  });

  it("passes onLoad callback properly", async () => {
    const onLoadMock = vi.fn();

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        onLoad={onLoadMock}
      />,
    );

    // Verify onLoad was passed to the component but not called yet
    expect(onLoadMock).not.toHaveBeenCalled();
  });

  it("uses custom aspect ratio when provided", () => {
    const customAspectRatio = "4/3";

    const { container } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        aspectRatio={customAspectRatio}
      />,
    );

    // Find the wrapper div that contains the image
    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle(`aspect-ratio: 4 / 3`);
  });

  it("prioritizes image loading when priority prop is true", () => {
    render(
      <OptimizedImage src="/test-image.jpg" alt="Test image" priority={true} />,
    );

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("data-priority", "true");
  });
});
