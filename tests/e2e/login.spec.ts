import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("login page loads and shows email and password fields", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /case chronicle/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in|login/i })).toBeVisible();
  });

  test("signup tab switches to signup form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("tab", { name: /sign up|register/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("tab", { name: /sign up|register/i }).click();

    await expect(page.getByLabel(/first name|firstName/i)).toBeVisible();
    await expect(page.getByLabel(/last name|lastName/i)).toBeVisible();
  });
});
