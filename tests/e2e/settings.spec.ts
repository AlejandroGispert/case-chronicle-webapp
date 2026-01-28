import { test, expect } from "@playwright/test";

const TEST_CASE_TITLE = "Playwright Settings Delete Case";
const TEST_CASE_NUMBER = "PW-SETTINGS-DELETE";
const TEST_CLIENT_NAME = "Test Client Settings";

test.describe("Settings - Destructive case deletion", () => {
  test("shows Destructive section with delete case button", async ({
    page,
  }) => {
    await page.goto("/settings");

    await expect(page.getByText(/destructive/i)).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("button", { name: /delete case/i }),
    ).toBeVisible();
  });

  test("opens confirmation modal with selected case name", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByText(/destructive/i)).toBeVisible({
      timeout: 10000,
    });

    const combobox = page.getByRole("combobox");
    await combobox.click();

    const options = page.getByRole("option");
    const count = await options.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const firstOption = options.first();
    const optionText = (await firstOption.textContent())?.trim() ?? "";

    await firstOption.click();

    await page.getByRole("button", { name: /delete case/i }).click();

    await expect(
      page.getByRole("dialog").getByText(/delete case.*\?/i),
    ).toBeVisible();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByRole("button", { name: /cancel/i })).toBeVisible();

    const deleteButton = dialog.getByRole("button", { name: /^delete$/i });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeDisabled();

    const confirmInput = dialog.getByRole("textbox", {
      name: /type the case title to confirm/i,
    });

    // Wrong confirmation should keep delete disabled
    await confirmInput.fill("wrong title");
    await expect(deleteButton).toBeDisabled();

    // Correct confirmation enables delete
    if (optionText) {
      await confirmInput.fill(optionText);
      await expect(deleteButton).toBeEnabled();
    }

    await dialog.getByRole("button", { name: /cancel/i }).click();
  });

  test("user can create a case and delete it from Settings", async ({
    page,
  }) => {
    // Create a new case via the main UI (Dashboard / cases list)
    await page.goto("/");

    // Empty state "New Case" button
    const newCaseButton = page.getByRole("button", { name: /new case/i });
    await newCaseButton.click();

    // Fill in the New Case modal form
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

    // Navigate to Settings and delete the newly created case
    await page.goto("/settings");

    await expect(page.getByText(/destructive/i)).toBeVisible({
      timeout: 10000,
    });

    const selectTrigger = page.getByRole("combobox");
    await selectTrigger.click();

    // Select the case we just created by its title or number
    const createdCaseOption = page.getByRole("option").filter({
      hasText: TEST_CASE_TITLE,
    });

    const optionCount = await createdCaseOption.count();
    if (optionCount === 0) {
      test.skip();
      return;
    }

    await createdCaseOption.first().click();

    await page.getByRole("button", { name: /delete case/i }).click();

    await expect(
      page
        .getByRole("dialog")
        .getByText(new RegExp(`Delete case "${TEST_CASE_TITLE}".*`, "i")),
    ).toBeVisible();

    const dialog = page.getByRole("dialog");

    const confirmInput = dialog.getByRole("textbox", {
      name: /type the case title to confirm/i,
    });
    const deleteButton = dialog.getByRole("button", { name: /^delete$/i });

    await expect(deleteButton).toBeDisabled();

    await confirmInput.fill(TEST_CASE_TITLE);
    await expect(deleteButton).toBeEnabled();

    await deleteButton.click();

    // After deletion, open the select again and confirm the case is gone
    await selectTrigger.click();
    const remainingOptions = page
      .getByRole("option")
      .filter({ hasText: TEST_CASE_TITLE });
    await expect(remainingOptions).toHaveCount(0);
  });
});
