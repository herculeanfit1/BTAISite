"use client";

import { styles } from "@/app/styles/home";

/**
 * Footer Section Component
 * Displays copyright information
 */
export const FooterSection = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.footerContent}>
          {/* Copyright notice */}
          <div style={styles.copyright}>
            <p>© 2025 Bridging Trust AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
