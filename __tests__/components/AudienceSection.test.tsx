import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";

import { AudienceSection } from "../../app/components/home/AudienceSection";

describe("AudienceSection Component", () => {
  it("renders the section heading", () => {
    render(<AudienceSection />);
    expect(screen.getByText("Who We Help")).toBeInTheDocument();
  });

  it("states the qualifying criteria", () => {
    const { container } = render(<AudienceSection />);
    const text = container.textContent ?? "";
    expect(text).toContain("mid-market and growth-stage organizations");
    expect(text).toContain("not an AI mandate looking for a use case");
  });

  it("anchors the section as #who-we-help", () => {
    const { container } = render(<AudienceSection />);
    expect(container.querySelector("section")?.id).toBe("who-we-help");
  });
});
