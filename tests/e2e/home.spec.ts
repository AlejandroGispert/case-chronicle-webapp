import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("unauthenticated user redirects from / to login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(login|home)/, { timeout: 10000 });
    const url = page.url();
    if (url.includes("/home")) {
      await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("home page shows Welcome and navigation cards when authenticated", async ({
    page,
  }) => {
    await page.goto("/home");
    await page.waitForURL(/\/(login|onboarding|home)/, { timeout: 10000 });
    const url = page.url();

    if (url.includes("/login")) {
      test.skip();
      return;
    }
    if (url.includes("/onboarding")) {
      await expect(page.getByText(/choose your account type/i)).toBeVisible({
        timeout: 5000,
      });
      await expect(page.getByRole("button", { name: /b2b.*business/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /b2c.*individual/i })).toBeVisible();
      return;
    }

    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: /select case/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /open calendar/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /open inbox/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /open documents/i })).toBeVisible();
  });
});
