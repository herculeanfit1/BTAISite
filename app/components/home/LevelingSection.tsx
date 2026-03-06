"use client";

/**
 * LevelingSection Component
 *
 * Displays the "Empowering Ambitious Businesses" section with a list of benefits.
 * This section highlights how the company helps businesses compete with larger competitors.
 *
 * @returns {JSX.Element} The rendered leveling section
 */
export const LevelingSection = () => {
  // Styles for the section
  const sectionStyles = {
    padding: "5rem 1.5rem",
    backgroundColor: "#F9FAFB",
    width: "100%",
  };

  // Styles for the container
  const containerStyles = {
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
  };

  // Styles for the heading
  const headingStyles = {
    fontSize: "2rem",
    fontWeight: "bold" as const,
    marginBottom: "1.5rem",
    textAlign: "center" as const,
    lineHeight: 1.2,
  };

  // Styles for the paragraph
  const paragraphStyles = {
    marginBottom: "1.25rem",
  };

  // Styles for the list
  const listStyles = {
    listStyleType: "disc",
    paddingLeft: "1.5rem",
    color: "#4B5563",
    marginBottom: "2rem",
    lineHeight: 1.6,
    maxWidth: "64rem",
    margin: "0 auto 2rem auto",
  };

  // Styles for list items
  const listItemStyles = {
    marginBottom: "1rem",
  };

  // Styles for bold text in list items
  const strongStyles = {
    fontWeight: 600,
  };

  return (
    <section id="leveling" style={sectionStyles}>
      <div style={containerStyles}>
        <h2 style={headingStyles}>The Challenges You&#39;re Facing</h2>
        <p style={paragraphStyles}>
          Organizations across every industry are under pressure to adopt AI — but moving fast without the right foundation creates risk. These are the problems we solve.
        </p>
        <ul style={listStyles}>
          <li style={listItemStyles}>
            <span style={strongStyles}>&ldquo;We want Copilot, but we don&#39;t know if our data is ready.&rdquo;</span>{" "}
            Most organizations have classification gaps, overshared content, and unclear retention policies that make broad AI deployment risky. We help you find and fix those gaps before they become incidents.
          </li>
          <li style={listItemStyles}>
            <span style={strongStyles}>&ldquo;We need AI governance before we can scale.&rdquo;</span>{" "}
            Leadership wants AI, but there&#39;s no framework for who approves what, how risk is assessed, or what acceptable use looks like. We build the governance structure so AI can move from pilot to production.
          </li>
          <li style={listItemStyles}>
            <span style={strongStyles}>&ldquo;We have too many environments and unclear controls.&rdquo;</span>{" "}
            Power Platform sprawl, ungoverned Copilot Studio agents, and inconsistent admin configurations create shadow AI risk. We help you inventory, rationalize, and govern.
          </li>
          <li style={listItemStyles}>
            <span style={strongStyles}>&ldquo;We need to enable AI without creating compliance exposure.&rdquo;</span>{" "}
            Regulated industries and security-conscious organizations can&#39;t afford to deploy AI and figure out compliance later. We align AI initiatives with your existing security, compliance, and risk posture from day one.
          </li>
        </ul>
      </div>
    </section>
  );
};
