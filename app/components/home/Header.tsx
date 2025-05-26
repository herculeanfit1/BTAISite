"use client";

import Image from "next/image";
import { styles } from "@/app/styles/home";
import Link from "next/link";

interface HeaderProps {
  isDesktop: boolean;
}

/**
 * Header Component
 * Main navigation header with logo and links
 */
export const Header = ({ isDesktop }: HeaderProps) => {
  return (
    <header style={styles.header}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Image
          src="/images/logo/BTAI_Logo_Original.svg"
          alt="Bridging Trust AI Logo"
          width={72}
          height={72}
          style={{ marginRight: "16px" }}
        />
        <div style={styles.logo}>Bridging Trust AI</div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <nav style={isDesktop ? styles.navDesktop : styles.nav}>
          <Link href="#solutions" style={styles.navLink}>
            Solutions
          </Link>
          <Link
            href="#about"
            style={{ ...styles.navLink, marginRight: "1.5rem" }}
          >
            About
          </Link>
        </nav>
        <Link
          href="#contact"
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            backgroundColor: "#5B90B0",
            color: "#FCFCFC",
            textDecoration: "none",
            fontWeight: 500,
            padding: "0.75rem 1.5rem",
            borderRadius: 0,
          }}
        >
          Contact
        </Link>
      </div>
    </header>
  );
};
