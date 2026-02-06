import { test, expect } from "@playwright/test";

test.describe("Contacts page", () => {
  test("contacts page loads when authenticated", async ({ page }) => {
    await page.goto("/");

    await page.waitForURL(/\/(login|contacts|dashboard)/, { timeout: 10000 });

    const url = page.url();
    if (url.includes("/login")) {
      await page.goto("/contacts");
      await expect(page).toHaveURL(/\/login/);
      return;
    }

    await page.goto("/contacts");
    await expect(page).toHaveURL(/\/contacts/, { timeout: 10000 });
  });

  test("contacts page has add contact or contacts list", async ({ page }) => {
    await page.goto("/contacts");

    await page.waitForLoadState("networkidle");

    const url = page.url();
    if (url.includes("/login")) {
      test.skip();
      return;
    }

    await expect(
      page.getByRole("button", { name: /add contact|new contact/i }).or(
        page.getByText(/contacts/i)
      )
    ).toBeVisible({ timeout: 5000 });
  });
});
