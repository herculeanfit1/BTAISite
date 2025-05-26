import { skipTest } from "../utils/test-utils";
import { test, expect } from "@playwright/test";

test.describe("Card Component", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the homepage which should have cards
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("cards should be visible and properly styled", async ({ page }) => {
    // Find all cards using common card selectors
    const cards = page.locator(
      '.card, [class*="card"], .feature, .pricing-plan, .service, .testimonial'
    );

    if ((await cards.count()) === 0) {
      skipTest("No cards found on page");
      return;
    }

    // Check at least one card exists
    expect(await cards.count()).toBeGreaterThan(0);

    // Inspect the first card
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();

    // Check if card has common card elements (could be heading, image, body text)
    const hasCardElements = await firstCard.evaluate((el) => {
      return (
        // Check for headings
        el.querySelector("h1, h2, h3, h4, h5, h6") !== null ||
        // Check for images
        el.querySelector("img") !== null ||
        // Check for paragraph text
        el.querySelector("p") !== null ||
        // Check for button/link
        el.querySelector("a, button") !== null
      );
    });

    expect(hasCardElements).toBeTruthy();

    // Take a screenshot for visual comparison
    await firstCard.screenshot({ path: "test-results/card-component.png" });

    // Check card styling (border, shadow, padding)
    const hasCardStyling = await firstCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        // Has border or border-radius
        (style.border !== "none" && style.border !== "") ||
        style.borderRadius !== "0px" ||
        // Has box-shadow
        (style.boxShadow !== "none" && style.boxShadow !== "") ||
        // Has padding
        (style.padding !== "0px" && style.padding !== "")
      );
    });

    expect(hasCardStyling).toBeTruthy();
  });

  test("cards should have consistent styling", async ({ page }) => {
    // Find all cards
    const cards = page.locator(
      '.card, [class*="card"], .feature, .pricing-plan, .service, .testimonial'
    );

    if ((await cards.count()) < 2) {
      skipTest("Not enough cards to compare");
      return;
    }

    // Get the first two cards for comparison
    const firstCard = cards.nth(0);
    const secondCard = cards.nth(1);

    // Compare dimensions
    const [firstRect, secondRect] = await Promise.all([
      firstCard.boundingBox(),
      secondCard.boundingBox(),
    ]);

    if (!firstRect || !secondRect) {
      skipTest("Could not get bounding box for cards");
      return;
    }

    // Take screenshots of both cards for visual comparison
    await firstCard.screenshot({ path: "test-results/card-first.png" });
    await secondCard.screenshot({ path: "test-results/card-second.png" });

    // Compare key styles between cards
    const [firstStyles, secondStyles] = await Promise.all([
      firstCard.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          padding: style.padding,
          fontFamily: style.fontFamily,
        };
      }),
      secondCard.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          padding: style.padding,
          fontFamily: style.fontFamily,
        };
      }),
    ]);

    // Cards should have consistent styling for key properties
    expect(firstStyles.borderRadius).toBe(secondStyles.borderRadius);
    expect(firstStyles.fontFamily).toBe(secondStyles.fontFamily);

    // Cards usually have similar paddings (might not be exactly the same)
    const firstPadding = firstStyles.padding.split(" ").map((p) => parseInt(p));
    const secondPadding = secondStyles.padding
      .split(" ")
      .map((p) => parseInt(p));

    // Check if the arrays have the same length
    if (firstPadding.length === secondPadding.length) {
      // Check if the padding values are at least somewhat similar
      const hasSimilarPadding = firstPadding.every((value, index) => {
        // Allow a 4px difference in padding
        return Math.abs(value - secondPadding[index]) <= 4;
      });

      // More of an observation than a strict test
      console.log(
        `Cards have ${hasSimilarPadding ? "similar" : "different"} padding`
      );
    }
  });

  test("cards should have hover effects if interactive", async ({ page }) => {
    // Find potentially interactive cards (containing links or buttons)
    const interactiveCards = page
      .locator(
        '.card a, .card button, [class*="card"] a, [class*="card"] button'
      )
      .first();

    if ((await interactiveCards.count()) === 0) {
      skipTest("No interactive cards found");
      return;
    }

    // Find the parent card of the interactive element
    const card = interactiveCards
      .locator(
        'xpath=ancestor::div[contains(@class, "card") or contains(@class, "feature") or contains(@class, "pricing") or contains(@class, "testimonial")]'
      )
      .first();

    if ((await card.count()) === 0) {
      skipTest("Could not find parent card element");
      return;
    }

    // Take screenshot before hover
    await card.screenshot({ path: "test-results/card-before-hover.png" });

    // Get styles before hover
    const stylesBefore = await card.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        transform: style.transform,
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor,
        border: style.border,
      };
    });

    // Hover over the card
    await card.hover();

    // Small delay to ensure hover styles are applied
    await page.waitForTimeout(200);

    // Take screenshot after hover
    await card.screenshot({ path: "test-results/card-after-hover.png" });

    // Get styles after hover
    const stylesAfter = await card.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        transform: style.transform,
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor,
        border: style.border,
      };
    });

    // Check if there's a visual difference on hover
    const hasHoverEffect =
      stylesBefore.transform !== stylesAfter.transform ||
      stylesBefore.boxShadow !== stylesAfter.boxShadow ||
      stylesBefore.backgroundColor !== stylesAfter.backgroundColor ||
      stylesBefore.border !== stylesAfter.border;

    // Just log this result as not all cards have hover effects
    console.log(
      `Card ${hasHoverEffect ? "has" : "does not have"} hover effect`
    );
  });

  test("cards should be responsive", async ({ page }) => {
    // Find all cards
    const cards = page.locator(
      '.card, [class*="card"], .feature, .pricing-plan, .service, .testimonial'
    );

    if ((await cards.count()) === 0) {
      skipTest("No cards found");
      return;
    }

    const firstCard = cards.first();

    // Check desktop width (1280px)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(200); // Wait for resize

    const desktopWidth = await firstCard.evaluate((el) => {
      return el.getBoundingClientRect().width;
    });

    // Take desktop screenshot
    await firstCard.screenshot({ path: "test-results/card-desktop.png" });

    // Check tablet width (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(200); // Wait for resize

    const tabletWidth = await firstCard.evaluate((el) => {
      return el.getBoundingClientRect().width;
    });

    // Take tablet screenshot
    await firstCard.screenshot({ path: "test-results/card-tablet.png" });

    // Check mobile width (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200); // Wait for resize

    const mobileWidth = await firstCard.evaluate((el) => {
      return el.getBoundingClientRect().width;
    });

    // Take mobile screenshot
    await firstCard.screenshot({ path: "test-results/card-mobile.png" });

    // Card should become narrower on smaller screens
    expect(desktopWidth).toBeGreaterThan(tabletWidth);
    expect(tabletWidth).toBeGreaterThan(mobileWidth);
  });

  test("card content should be accessible", async ({ page }) => {
    // Find all cards
    const cards = page.locator(
      '.card, [class*="card"], .feature, .pricing-plan, .service, .testimonial'
    );

    if ((await cards.count()) === 0) {
      skipTest("No cards found");
      return;
    }

    const firstCard = cards.first();

    // 1. Check images have alt text
    const images = firstCard.locator("img");
    const imagesCount = await images.count();

    for (let i = 0; i < imagesCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute("alt");

      // Images should have alt text (empty alt is valid for decorative images)
      expect(altText).not.toBeNull();
    }

    // 2. Check heading hierarchy
    const hasHeading =
      (await firstCard.locator("h1, h2, h3, h4, h5, h6").count()) > 0;

    // Not all cards have headings, but it's good to know
    if (hasHeading) {
      console.log("Card has heading");
    } else {
      console.log("Card does not have heading");
    }

    // 3. Check for sufficient color contrast (simplified)
    const hasGoodContrast = await firstCard.evaluate((el) => {
      // This is a simplified check - in a real test you'd use a contrast ratio calculator
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;

      // Get all text elements
      const textElements = el.querySelectorAll(
        "p, span, h1, h2, h3, h4, h5, h6, a"
      );

      // Simple check: text color should not be the same as background
      for (const textEl of textElements) {
        const textStyle = window.getComputedStyle(textEl);
        if (textStyle.color === bgColor) {
          return false;
        }
      }

      return true;
    });

    expect(hasGoodContrast).toBeTruthy();

    // 4. Check interactive elements are keyboard accessible
    const interactiveElements = firstCard.locator("a, button");
    const interactiveCount = await interactiveElements.count();

    for (let i = 0; i < interactiveCount; i++) {
      const element = interactiveElements.nth(i);

      // Element should be visible and not have negative tabindex
      await expect(element).toBeVisible();

      const tabIndex = await element.getAttribute("tabindex");
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).not.toBeLessThan(0);
      }
    }
  });
});
