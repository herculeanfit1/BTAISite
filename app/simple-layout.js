/**
 * Simple Layout Component
 *
 * This is a minimal layout that doesn't import globals.css to avoid Tailwind compilation issues.
 * We're isolating potential CSS processing problems by removing the import of global styles.
 */
export default function SimpleLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
