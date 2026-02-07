import { test, expect } from "@playwright/test";

test.describe("Onboarding - app explanation", () => {
  test("onboarding page explains the app and has Continue button", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.waitForURL(/\/(login|onboarding)/, { timeout: 10000 });

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await expect(page.getByText(/welcome to case chronicle/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("button", { name: /continue/i }),
    ).toBeVisible();
  });
});
