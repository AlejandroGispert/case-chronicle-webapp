import { test, expect } from "@playwright/test";

test.describe("Share Case page", () => {
  test("share case page loads when authenticated", async ({ page }) => {
    await page.goto("/");

    await page.waitForURL(/\/(login|share|dashboard)/, { timeout: 10000 });

    const url = page.url();
    if (url.includes("/login")) {
      await page.goto("/share-case");
      await expect(page).toHaveURL(/\/login/);
      return;
    }

    await page.goto("/share-case");
    await expect(page).toHaveURL(/\/share-case/, { timeout: 10000 });
  });

  test("share case page shows cases or empty state", async ({ page }) => {
    await page.goto("/share-case");

    await page.waitForLoadState("networkidle");

    const url = page.url();
    if (url.includes("/login")) {
      test.skip();
      return;
    }

    await expect(
      page.getByText(/share|no cases|cases/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
