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
        <h2 style={headingStyles}>Empowering Ambitious Businesses</h2>
        <p style={paragraphStyles}>
          We equip agile organizations to operate with the technological muscle
          traditionally reserved for industry giants.
        </p>
        <p style={paragraphStyles}>Our clients gain:</p>
        <ul style={listStyles}>
          <li style={listItemStyles}>
            <span style={strongStyles}>Right-Sized Enterprise AI</span>: Proven,
            enterprise-class AI frameworks tailored to your scale, objectives,
            and budget.
          </li>
          <li style={listItemStyles}>
            <span style={strongStyles}>Accelerated Time-to-Value</span>: A
            rapid-deployment methodology that moves from use-case validation to
            production in weeks—not quarters—so you realize ROI sooner.
          </li>
          <li style={listItemStyles}>
            <span style={strongStyles}>Focused Competitive Advantage</span>:
            Collaborative discovery that pinpoints the highest-impact AI
            opportunities in your value chain, ensuring resources flow to
            initiatives that materially shift your market position.
          </li>
          <li style={listItemStyles}>
            <span style={strongStyles}>Built-In Capability Transfer</span>:
            Every engagement embeds training, documentation, and governance so
            your team can confidently operate and evolve the solution.
          </li>
        </ul>
      </div>
    </section>
  );
};
