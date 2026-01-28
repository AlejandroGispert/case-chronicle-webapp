import { test, expect } from "@playwright/test";

test("app loads home page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Case Chronicle/i);
});
