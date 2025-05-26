import Link from "next/link";
import { Route } from "next";
import { layoutStyles } from "@/app/styles/components/layout";
import { typographyStyles } from "@/app/styles/components/typography";
import { buttonStyles } from "@/app/styles/components/buttons";
import { FeatureData } from "@/app/data/features";
import { CSSProperties } from "react";

/**
 * FeatureCard Component
 *
 * Displays an individual feature card with icon, title, description, and a link.
 * Used within the FeaturesSection component to display AI solution offerings.
 *
 * @param {Object} props - Component props
 * @param {FeatureData} props.feature - The feature data to display (id, icon, title, description, link)
 * @param {CSSProperties} [props.style] - Optional custom styles for the card
 * @returns {JSX.Element} The rendered feature card
 */
interface FeatureCardProps {
  feature: FeatureData;
  style?: CSSProperties;
}

export const FeatureCard = ({ feature, style }: FeatureCardProps) => {
  // Determine link text based on feature ID
  const getLinkText = () => {
    switch (feature.id) {
      case 1:
        return "Learn More →";
      case 2:
        return "Explore Solutions →";
      case 3:
        return "View Services →";
      default:
        return "Learn More →";
    }
  };

  // Merge default card styles with any custom styles passed as props
  const cardStyles = { ...layoutStyles.card, ...style };

  return (
    <div style={cardStyles}>
      <div style={layoutStyles.iconFeature}>{feature.icon}</div>
      <h3 style={typographyStyles.heading3}>{feature.title}</h3>
      <p style={{ ...typographyStyles.paragraph, color: "#4B5563" }}>
        {feature.description}
      </p>
      <Link href={feature.link as Route} style={buttonStyles.featureLink}>
        {getLinkText()}
      </Link>
    </div>
  );
};
