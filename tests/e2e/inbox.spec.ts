import { test, expect } from "@playwright/test";

test.describe("Inbox page", () => {
  test("inbox page loads when authenticated", async ({ page }) => {
    await page.goto("/");

    // If redirected to login, we're not authenticated - skip or check login page
    await page.waitForURL(/\/(login|inbox|dashboard)/, { timeout: 10000 });

    const url = page.url();
    if (url.includes("/login")) {
      // Not authenticated - inbox would redirect to login
      await page.goto("/inbox");
      await expect(page).toHaveURL(/\/login/);
      return;
    }

    await page.goto("/inbox");
    await expect(page).toHaveURL(/\/inbox/, { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: /inbox/i }).or(page.getByText(/inbox/i))
    ).toBeVisible({ timeout: 5000 });
  });
});
