import { test, expect } from "@playwright/test";
import { testVisualRegression } from "../utils/test-utils";
import type { Page, Locator } from "@playwright/test";

interface TestCase {
  name: string;
  test: (component: Locator, page?: Page) => Promise<void>;
}

interface ComponentSelector {
  name: string;
  selector: string;
}

interface ComponentConfig {
  selectors: ComponentSelector[];
  testCases: TestCase[];
}

// Component selectors and test configurations
const UI_COMPONENTS: Record<string, ComponentConfig> = {
  buttons: {
    selectors: [
      { name: "primary", selector: '.btn-primary, button[class*="primary"]' },
      {
        name: "secondary",
        selector: '.btn-secondary, button[class*="secondary"]',
      },
      { name: "link", selector: 'a.link, .btn-link, button[class*="link"]' },
    ],
    testCases: [
      {
        name: "visibility",
        test: async (component: Locator) =>
          await expect(component).toBeVisible(),
      },
      {
        name: "clickable",
        test: async (component: Locator) => await component.click(),
      },
      {
        name: "hover",
        test: async (component: Locator, page?: Page) => {
          await component.hover();
          if (page) {
            await page.waitForTimeout(300); // Wait for hover effect
          }
        },
      },
      {
        name: "focus",
        test: async (component: Locator) => await component.focus(),
      },
    ],
  },
  cards: {
    selectors: [
      { name: "feature", selector: '.feature-card, [class*="feature-card"]' },
      {
        name: "pricing",
        selector: '.pricing-card, [class*="pricing"], .price-card',
      },
      { name: "service", selector: '.service-card, [class*="service-card"]' },
      {
        name: "testimonial",
        selector: '.testimonial-card, [class*="testimonial"]',
      },
    ],
    testCases: [
      {
        name: "visibility",
        test: async (component: Locator) =>
          await expect(component).toBeVisible(),
      },
      {
        name: "title",
        test: async (component: Locator) => {
          const title = component
            .locator('h2, h3, h4, [class*="title"]')
            .first();
          if ((await title.count()) > 0) {
            await expect(title).toBeVisible();
            await expect(title).not.toHaveText("");
          }
        },
      },
      {
        name: "content",
        test: async (component: Locator) => {
          const content = component
            .locator('p, [class*="content"], [class*="description"]')
            .first();
          if ((await content.count()) > 0) {
            await expect(content).toBeVisible();
          }
        },
      },
      {
        name: "image",
        test: async (component: Locator) => {
          const image = component.locator("img, svg").first();
          if ((await image.count()) > 0) {
            await expect(image).toBeVisible();
          }
        },
      },
    ],
  },
  navigation: {
    selectors: [
      { name: "header", selector: 'header, nav, [role="navigation"]' },
      { name: "footer", selector: "footer" },
      { name: "mobile-menu", selector: '.mobile-menu, [class*="mobile-nav"]' },
    ],
    testCases: [
      {
        name: "visibility",
        test: async (component: Locator) =>
          await expect(component).toBeVisible(),
      },
      {
        name: "links",
        test: async (component: Locator) => {
          const links = component.locator("a");
          expect(await links.count()).toBeGreaterThan(0);
          await expect(links.first()).toBeVisible();
        },
      },
      {
        name: "logo",
        test: async (component: Locator) => {
          const logo = component.locator(".logo, img, svg").first();
          if ((await logo.count()) > 0) {
            await expect(logo).toBeVisible();
          }
        },
      },
    ],
  },
  forms: {
    selectors: [
      { name: "contact", selector: "form, .contact-form" },
      { name: "search", selector: 'form[role="search"], .search-form' },
      {
        name: "newsletter",
        selector: 'form[class*="newsletter"], .newsletter-form',
      },
    ],
    testCases: [
      {
        name: "visibility",
        test: async (component: Locator) =>
          await expect(component).toBeVisible(),
      },
      {
        name: "inputs",
        test: async (component: Locator) => {
          const inputs = component.locator("input, textarea, select");
          if ((await inputs.count()) > 0) {
            await expect(inputs.first()).toBeVisible();
          }
        },
      },
      {
        name: "labels",
        test: async (component: Locator) => {
          const labels = component.locator("label");
          if ((await labels.count()) > 0) {
            await expect(labels.first()).toBeVisible();
          }
        },
      },
      {
        name: "submit",
        test: async (component: Locator) => {
          const submit = component
            .locator('button[type="submit"], input[type="submit"]')
            .first();
          if ((await submit.count()) > 0) {
            await expect(submit).toBeVisible();
          }
        },
      },
    ],
  },
};

test.describe("UI Components", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // Test Button Components
  test.describe("Button Components", () => {
    test("primary and secondary buttons should have correct styles and behaviors", async ({
      page,
    }) => {
      // Test primary buttons
      const primaryButton = page
        .locator(UI_COMPONENTS.buttons.selectors[0].selector)
        .first();
      if ((await primaryButton.count()) > 0) {
        // Run all button test cases
        for (const testCase of UI_COMPONENTS.buttons.testCases) {
          await testCase.test(primaryButton, page);
        }

        // Visual regression for primary button
        await testVisualRegression(
          page,
          UI_COMPONENTS.buttons.selectors[0].selector,
          "primary-button",
          {
            variants: [
              {
                name: "hover",
                setup: async () => {
                  await primaryButton.hover();
                  await page.waitForTimeout(300);
                },
              },
              {
                name: "focus",
                setup: async () => {
                  await primaryButton.focus();
                },
              },
            ],
          }
        );
      }

      // Test secondary buttons
      const secondaryButton = page
        .locator(UI_COMPONENTS.buttons.selectors[1].selector)
        .first();
      if ((await secondaryButton.count()) > 0) {
        await expect(secondaryButton).toBeVisible();
        await secondaryButton.hover();
        await page.waitForTimeout(300);

        // Visual test
        await testVisualRegression(
          page,
          UI_COMPONENTS.buttons.selectors[1].selector,
          "secondary-button"
        );
      }
    });
  });

  // Test Card Components
  test.describe("Card Components", () => {
    test("feature and pricing cards should display correctly", async ({
      page,
    }) => {
      // Navigate to a page where cards are likely to be found
      await page.goto("/");

      // Test feature cards
      const featureCard = page
        .locator(UI_COMPONENTS.cards.selectors[0].selector)
        .first();
      if ((await featureCard.count()) > 0) {
        // Run all card test cases
        for (const testCase of UI_COMPONENTS.cards.testCases) {
          await testCase.test(featureCard, page);
        }

        // Visual regression
        await testVisualRegression(
          page,
          UI_COMPONENTS.cards.selectors[0].selector,
          "feature-card"
        );
      }

      // Navigate to pricing page if available to test pricing cards
      try {
        await page.goto("/pricing");
        await page.waitForLoadState("networkidle");

        const pricingCard = page
          .locator(UI_COMPONENTS.cards.selectors[1].selector)
          .first();
        if ((await pricingCard.count()) > 0) {
          await expect(pricingCard).toBeVisible();

          // Check for price
          const price = pricingCard.locator('.price, [class*="price"]');
          if ((await price.count()) > 0) {
            await expect(price).toBeVisible();
          }

          // Check for features list
          const features = pricingCard.locator("ul, ol");
          if ((await features.count()) > 0) {
            await expect(features).toBeVisible();
          }

          // Visual regression
          await testVisualRegression(
            page,
            UI_COMPONENTS.cards.selectors[1].selector,
            "pricing-card"
          );
        }
      } catch (_e) {
        // Pricing page might not exist, continue with other tests
        console.log("Pricing page not found or error navigating to it");
      }
    });
  });

  // Test Navigation Components
  test.describe("Navigation Components", () => {
    test("header and mobile navigation should work correctly", async ({
      page,
    }) => {
      // Test header navigation
      const header = page
        .locator(UI_COMPONENTS.navigation.selectors[0].selector)
        .first();
      await expect(header).toBeVisible();

      // Test navigation links
      const navLinks = header.locator("a");
      expect(await navLinks.count()).toBeGreaterThan(0);

      // Test mobile navigation
      const viewportSize = page.viewportSize();
      if (viewportSize && viewportSize.width >= 768) {
        // Set mobile viewport to test mobile menu
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        // Look for hamburger menu
        const hamburgerMenu = page.locator(
          '[class*="hamburger"], button[aria-label*="menu" i], [class*="mobile-menu-button"]'
        );
        if ((await hamburgerMenu.count()) > 0) {
          await expect(hamburgerMenu).toBeVisible();

          // Open mobile menu
          await hamburgerMenu.click();
          await page.waitForTimeout(500);

          // Check mobile menu content
          const mobileMenu = page.locator(
            UI_COMPONENTS.navigation.selectors[2].selector
          );
          if ((await mobileMenu.count()) > 0) {
            await expect(mobileMenu).toBeVisible();

            // Check for links in mobile menu
            const mobileLinks = mobileMenu.locator("a");
            if ((await mobileLinks.count()) > 0) {
              await expect(mobileLinks.first()).toBeVisible();
            }
          }

          // Reset viewport
          await page.setViewportSize({ width: 1280, height: 720 });
        }
      }
    });
  });

  // Test Form Components
  test.describe("Form Components", () => {
    test("contact form should be functional and accessible", async ({
      page,
    }) => {
      // Navigate to contact page
      await page.goto("/contact");
      await page.waitForLoadState("networkidle");

      // Test contact form
      const contactForm = page
        .locator(UI_COMPONENTS.forms.selectors[0].selector)
        .first();
      if ((await contactForm.count()) > 0) {
        // Run all form test cases
        for (const testCase of UI_COMPONENTS.forms.testCases) {
          await testCase.test(contactForm, page);
        }

        // Test form interaction
        const nameInput = contactForm
          .locator('input[name="name"], input[placeholder*="name" i]')
          .first();
        const emailInput = contactForm
          .locator('input[type="email"], input[name="email"]')
          .first();

        if ((await nameInput.count()) > 0) {
          await nameInput.fill("Test User");
          await expect(nameInput).toHaveValue("Test User");
        }

        if ((await emailInput.count()) > 0) {
          await emailInput.fill("test@example.com");
          await expect(emailInput).toHaveValue("test@example.com");
        }

        // Visual regression for form
        await testVisualRegression(
          page,
          UI_COMPONENTS.forms.selectors[0].selector,
          "contact-form",
          {
            variants: [
              {
                name: "filled",
                setup: async () => {
                  // Inputs should already be filled from earlier steps
                },
              },
            ],
          }
        );
      }
    });

    test("newsletter form should be functional", async ({ page }) => {
      // Newsletter form might be on homepage or footer
      const newsletterForm = page
        .locator(UI_COMPONENTS.forms.selectors[2].selector)
        .first();
      if ((await newsletterForm.count()) > 0) {
        await expect(newsletterForm).toBeVisible();

        // Test email input
        const emailInput = newsletterForm
          .locator('input[type="email"], input[name="email"]')
          .first();
        if ((await emailInput.count()) > 0) {
          await emailInput.fill("newsletter@example.com");
          await expect(emailInput).toHaveValue("newsletter@example.com");
        }

        // Test submit button
        const submitButton = newsletterForm
          .locator('button[type="submit"], input[type="submit"]')
          .first();
        if ((await submitButton.count()) > 0) {
          await expect(submitButton).toBeVisible();
        }
      }
    });
  });

  // Test Dark Mode Toggle
  test.describe("Theme Components", () => {
    test("dark mode toggle should change theme", async ({ page }) => {
      // Find dark mode toggle
      const darkModeToggle = page
        .locator(
          'button[aria-label*="dark" i], button[aria-label*="theme" i], [data-testid="dark-mode-toggle"]'
        )
        .first();

      if ((await darkModeToggle.count()) > 0) {
        await expect(darkModeToggle).toBeVisible();

        // Get initial theme state
        const initialTheme = await page.evaluate(() => {
          return document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";
        });

        // Click toggle
        await darkModeToggle.click();
        await page.waitForTimeout(500); // Wait for transitions

        // Check if theme changed
        const newTheme = await page.evaluate(() => {
          return document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";
        });

        expect(newTheme).not.toEqual(initialTheme);

        // Visual regression for toggle
        await testVisualRegression(page, darkModeToggle, "dark-mode-toggle");
      }
    });
  });

  // Test Responsive Behavior
  test.describe("Responsive Behavior", () => {
    test("mobile menu should be accessible on small screens", async ({
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Check for hamburger menu
      const hamburgerMenu = page.locator(
        '[class*="hamburger"], button[aria-label*="menu" i], [class*="mobile-menu-button"]'
      );
      if ((await hamburgerMenu.count()) > 0) {
        await expect(hamburgerMenu).toBeVisible();

        // Open mobile menu
        await hamburgerMenu.click();
        await page.waitForTimeout(500);

        // Check if menu is visible
        const mobileMenu = page.locator(
          '.mobile-menu, [class*="mobile-nav"], nav[aria-expanded="true"]'
        );
        if ((await mobileMenu.count()) > 0) {
          await expect(mobileMenu).toBeVisible();
        }

        // Take screenshot for visual comparison
        await testVisualRegression(page, "body", "mobile-menu-open", {
          fullPage: false,
        });

        // Reset viewport
        await page.setViewportSize({ width: 1280, height: 720 });
      }
    });
  });
});
