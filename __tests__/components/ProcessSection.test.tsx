import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";

import { ProcessSection } from "../../app/components/home/ProcessSection";

describe("ProcessSection Component", () => {
  it("renders the section heading", () => {
    render(<ProcessSection />);
    expect(screen.getByText("How We Work")).toBeInTheDocument();
  });

  it("renders all four steps of the engagement arc in order", () => {
    const { container } = render(<ProcessSection />);
    const headings = Array.from(container.querySelectorAll("h3")).map(
      (h) => h.textContent,
    );
    expect(headings).toEqual(["Assess", "Design", "Build", "Operate"]);
  });

  it("anchors the section as #process", () => {
    const { container } = render(<ProcessSection />);
    expect(container.querySelector("section")?.id).toBe("process");
  });
});
