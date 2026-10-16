import { expect, test } from "@playwright/test";

test("available seats are labeled and can be claimed", async ({ page }) => {
  await page.goto("/checkout/evt-lagos-jazz-night-2026");

  await expect(
    page.getByRole("heading", { name: "Interactive seating chart" }),
  ).toBeVisible();
  const viewer = page.getByRole("group", {
    name: /Fixed low front-angle 3D auditorium/,
  });
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).toBeVisible();
  const availableSeatLabels = page.locator(
    '[data-seat-status="available"][data-seat-label]',
  );
  await expect(availableSeatLabels.first()).toBeVisible();
  const clickableSeatIndex = await availableSeatLabels.evaluateAll((buttons) =>
    buttons.findIndex((button) => {
      const bounds = button.getBoundingClientRect();
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      const target = document.elementFromPoint(x, y);

      return (
        bounds.width > 0 &&
        bounds.height > 0 &&
        x >= 0 &&
        y >= 0 &&
        x < innerWidth &&
        y < innerHeight &&
        (target === button || target?.closest("button") === button)
      );
    }),
  );
  expect(clickableSeatIndex).toBeGreaterThanOrEqual(0);
  const selectedSeatLabel = availableSeatLabels.nth(clickableSeatIndex);
  const selectedSectionName =
    await selectedSeatLabel.getAttribute("data-seat-section");
  const selectedSeatName =
    await selectedSeatLabel.getAttribute("data-seat-label");
  expect(selectedSectionName).toBeTruthy();
  expect(selectedSeatName).toBeTruthy();
  await selectedSeatLabel.click();
  await expect(page.getByText("1 claimed", { exact: true })).toBeVisible();
  await expect(viewer).toBeVisible();
  await expect(
    page.locator(
      `[data-seat-section="${selectedSectionName}"][data-seat-label="${selectedSeatName}"][data-seat-status="selected"]`,
    ),
  ).toBeInViewport();

  await page.getByRole("button", { name: "Choose exact seats" }).click();

  const section = page.getByRole("region", { name: selectedSectionName ?? "" });
  await section
    .getByRole("button", { name: /available/ })
    .first()
    .click();

  await expect(section.locator('button[aria-pressed="true"]')).toHaveCount(2);
  await expect(
    section.locator('button[aria-pressed="true"]').last(),
  ).toBeDisabled();
  await expect(page.getByText("2 claimed", { exact: true })).toBeVisible();
});
