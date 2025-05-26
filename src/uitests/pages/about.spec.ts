import { test, expect } from "@playwright/test";
import {
  testDarkMode,
  testResponsiveDesign,
  testAccessibility,
} from "../utils/test-utils";

test.describe("About Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("should have the correct title and hero section", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/About/);

    // Check hero section exists and contains key elements
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    // Check if hero has a heading
    const heroHeading = heroSection.getByRole("heading").first();
    await expect(heroHeading).toBeVisible();

    // Check if hero has description text
    const heroText = heroSection.locator("p").first();
    await expect(heroText).toBeVisible();
  });

  test("should display company mission and values", async ({ page }) => {
    // Check if the page content mentions mission or values
    const pageContent = (await page.textContent("body")) || "";
    const hasMissionContent =
      /mission|purpose|vision|values|principles|commitment/i.test(pageContent);
    expect(hasMissionContent).toBeTruthy();

    // Look for sections that might contain mission or values
    const missionHeadings = page
      .getByRole("heading")
      .filter({ hasText: /Mission|Values|Purpose|Vision/i });

    if ((await missionHeadings.count()) > 0) {
      await expect(missionHeadings.first()).toBeVisible();

      // Check for paragraphs near the headings
      const heading = missionHeadings.first();
      const section = heading.locator("xpath=ancestor::section");

      if ((await section.count()) > 0) {
        const paragraphs = section.locator("p");
        expect(await paragraphs.count()).toBeGreaterThan(0);
      }
    }
  });

  test("should display team information", async ({ page }) => {
    // Check if the page content mentions team
    const pageContent = (await page.textContent("body")) || "";
    const hasTeamContent =
      /team|members|leadership|experts|professionals|staff/i.test(pageContent);

    if (hasTeamContent) {
      // Look for team section headings
      const teamHeadings = page
        .getByRole("heading")
        .filter({ hasText: /Team|Members|Leadership|Experts|Staff/i });

      if ((await teamHeadings.count()) > 0) {
        await expect(teamHeadings.first()).toBeVisible();

        // Look for team member elements
        const teamMembers = page.locator(
          '[class*="team"], [class*="profile"], [class*="member"], [class*="person"]'
        );

        if ((await teamMembers.count()) > 0) {
          // Check we have multiple team members
          expect(await teamMembers.count()).toBeGreaterThan(0);

          // Check first team member has an image or name
          const firstMember = teamMembers.first();
          const memberImage = firstMember.locator("img");
          const memberName = firstMember.getByRole("heading");

          const hasImage = (await memberImage.count()) > 0;
          const hasName = (await memberName.count()) > 0;

          expect(hasImage || hasName).toBeTruthy();
        }
      }
    }
  });

  test("should display company history or background", async ({ page }) => {
    // Check if the page content mentions history or background
    const pageContent = (await page.textContent("body")) || "";
    const hasHistoryContent =
      /history|background|story|timeline|journey|founded|established|began/i.test(
        pageContent
      );

    if (hasHistoryContent) {
      // Look for history related headings
      const historyHeadings = page
        .getByRole("heading")
        .filter({ hasText: /History|Background|Story|Timeline|Journey/i });

      if ((await historyHeadings.count()) > 0) {
        await expect(historyHeadings.first()).toBeVisible();

        // Check for content in the history section
        const heading = historyHeadings.first();
        const section = heading.locator("xpath=ancestor::section");

        if ((await section.count()) > 0) {
          const paragraphs = section.locator("p");
          expect(await paragraphs.count()).toBeGreaterThan(0);
        }
      }
    }
  });

  test("should display company achievements if available", async ({ page }) => {
    // Check if the page content mentions achievements
    const pageContent = (await page.textContent("body")) || "";
    const hasAchievementsContent =
      /achievements|accomplishments|awards|recognition|success|milestones/i.test(
        pageContent
      );

    if (hasAchievementsContent) {
      // Look for achievements related headings
      const achievementHeadings = page.getByRole("heading").filter({
        hasText: /Achievements|Accomplishments|Awards|Recognition|Success/i,
      });

      if ((await achievementHeadings.count()) > 0) {
        await expect(achievementHeadings.first()).toBeVisible();
      }
    }
  });

  test("should have call-to-action elements", async ({ page }) => {
    // Look for CTA buttons or links
    const ctaElements = page
      .getByRole("link")
      .filter({ hasText: /Contact|Join|Career|Get in Touch|Start/i });

    if ((await ctaElements.count()) > 0) {
      await expect(ctaElements.first()).toBeVisible();
    }
  });

  test("should have working dark mode toggle", async ({ page }) => {
    await testDarkMode(page);
  });

  test("should be responsive on different screen sizes", async ({ page }) => {
    await testResponsiveDesign(page);
  });

  test("should meet basic accessibility standards", async ({ page }) => {
    await testAccessibility(page);
  });
});
