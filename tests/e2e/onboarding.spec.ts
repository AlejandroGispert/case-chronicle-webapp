import { test, expect } from "@playwright/test";

test.describe("Onboarding - B2B / B2C choice", () => {
  test("onboarding page shows B2B and B2C options when visited", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.waitForURL(/\/(login|onboarding)/, { timeout: 10000 });

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await expect(page.getByText(/choose your account type/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("button", { name: /b2b.*business/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /b2c.*individual/i }),
    ).toBeVisible();
  });
});
