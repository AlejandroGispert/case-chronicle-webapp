import { test, expect } from "@playwright/test";

const TEST_CASE_TITLE = "Playwright Calendar Case";
const TEST_CASE_NUMBER = "PW-CAL-001";
const TEST_CLIENT_NAME = "Test Client Calendar";

test.describe("Calendar - case-filtered view", () => {
  test("Calendar button next to Register New Case Entry navigates to calendar with only that case's entries", async ({
    page,
  }) => {
    await page.goto("/");

    const newCaseBtn = page.getByRole("button", { name: /new case/i });
    await expect(newCaseBtn).toBeVisible({ timeout: 10000 });
    await newCaseBtn.click();

    await page
      .getByRole("textbox", { name: /case title/i })
      .fill(TEST_CASE_TITLE);
    await page
      .getByRole("textbox", { name: /case number/i })
      .fill(TEST_CASE_NUMBER);
    await page
      .getByRole("textbox", { name: /client name/i })
      .fill(TEST_CLIENT_NAME);
    await page.getByRole("button", { name: /create case/i }).click();

    const caseHeading = page.getByRole("heading", {
      name: new RegExp(TEST_CASE_TITLE, "i"),
    });
    await expect(caseHeading).toBeVisible({ timeout: 10000 });

    const card = caseHeading.locator(
      'xpath=ancestor::*[.//a[contains(@href,"/calendar?caseId=")]][1]',
    );
    const caseCalendarLink = card
      .locator('a[href*="/calendar?caseId="]')
      .first();
    await expect(caseCalendarLink).toBeVisible();
    await caseCalendarLink.click();

    await expect(page).toHaveURL(/\/calendar\?caseId=/);
    await expect(page.getByText(/viewing calendar for:/i)).toBeVisible();
    await expect(
      page.getByText(TEST_CASE_TITLE, { exact: false }),
    ).toBeVisible();
  });

  test("calendar shows year and month dropdowns", async ({ page }) => {
    await page.goto("/calendar");

    await expect(
      page.getByRole("heading", { name: /^calendar$/i }),
    ).toBeVisible({
      timeout: 10000,
    });

    const dropdowns = page.getByRole("combobox");
    await expect(dropdowns.first()).toBeVisible();
    expect(await dropdowns.count()).toBeGreaterThanOrEqual(1);
  });

  test("View all calendar clears case filter", async ({ page }) => {
    await page.goto("/");

    const newCaseBtn = page.getByRole("button", { name: /new case/i });
    await expect(newCaseBtn).toBeVisible({ timeout: 10000 });
    await newCaseBtn.click();

    await page
      .getByRole("textbox", { name: /case title/i })
      .fill(TEST_CASE_TITLE);
    await page
      .getByRole("textbox", { name: /case number/i })
      .fill(TEST_CASE_NUMBER);
    await page
      .getByRole("textbox", { name: /client name/i })
      .fill(TEST_CLIENT_NAME);
    await page.getByRole("button", { name: /create case/i }).click();

    const caseHeading = page.getByRole("heading", {
      name: new RegExp(TEST_CASE_TITLE, "i"),
    });
    await expect(caseHeading).toBeVisible({ timeout: 10000 });

    const card = caseHeading.locator(
      'xpath=ancestor::*[.//a[contains(@href,"/calendar?caseId=")]][1]',
    );
    await card.locator('a[href*="/calendar?caseId="]').first().click();

    await expect(page).toHaveURL(/\/calendar\?caseId=/);
    await expect(
      page.getByRole("link", { name: /view all calendar/i }),
    ).toBeVisible();
    await page.getByRole("link", { name: /view all calendar/i }).click();

    await expect(page).toHaveURL(/\/calendar$/);
    await expect(page.getByText(/viewing calendar for:/i)).not.toBeVisible();
  });
});
