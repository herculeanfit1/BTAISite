/**
 * Main Styles Index
 *
 * This file imports and re-exports all styles from the various style files.
 * This allows components to import styles from a single location.
 */

// Component styles
export { buttonStyles } from "./components/buttons";
export { layoutStyles } from "./components/layout";
export { typographyStyles } from "./components/typography";

// Section styles
export { heroStyles } from "./sections/hero";
export { featureStyles } from "./sections/features";
export { aboutStyles } from "./sections/about";
export { contactStyles } from "./sections/contact";
export { ctaStyles } from "./sections/cta";

/**
 * Merges all styles from different files into a single object
 * Can be used to import all styles at once
 */
import { buttonStyles } from "./components/buttons";
import { layoutStyles } from "./components/layout";
import { typographyStyles } from "./components/typography";
import { heroStyles } from "./sections/hero";
import { featureStyles } from "./sections/features";
import { aboutStyles } from "./sections/about";
import { contactStyles } from "./sections/contact";
import { ctaStyles } from "./sections/cta";

// Combined styles object
export const allStyles = {
  ...buttonStyles,
  ...layoutStyles,
  ...typographyStyles,
  ...heroStyles,
  ...featureStyles,
  ...aboutStyles,
  ...contactStyles,
  ...ctaStyles,
};
