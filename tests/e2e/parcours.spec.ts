import { expect, test } from "@playwright/test";

test("home -> studio -> student player -> quiz", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /One lesson/i })).toBeVisible();
  await page.getByRole("button", { name: "Photosynthesis", exact: true }).click();
  await page.getByRole("button", { name: "Generate video" }).click();

  await expect(page).toHaveURL(/\/p\//, { timeout: 20_000 });
  await expect(page.getByTestId("version")).toContainText("Version 1", { timeout: 20_000 });
  await expect(page.getByTestId("scene-strip")).toContainText("A plant");

  await page.getByRole("button", { name: "Script" }).click();
  await expect(page.getByTestId("script-panel")).toContainText("Quiz · 3 questions");

  await page.getByRole("button", { name: "Share" }).click();
  const share = await page.getByRole("textbox", { name: "Share link" }).inputValue();
  expect(share).toMatch(/\/v\//);
  await page.getByRole("button", { name: "Close" }).click();

  await page.goto(share);
  await expect(page.getByTestId("scene-stage")).toBeVisible();
  await page.getByRole("button", { name: /My notes/i }).click();
  await page.getByLabel("New note").fill("Review with the class");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByTestId("notes")).toContainText("Review with the class");

  await page.getByTestId("quiz-link").click();
  for (let i = 0; i < 3; i++) {
    await expect(page.getByTestId("question")).toBeVisible();
    await page.getByRole("group", { name: "Answer choices" }).getByRole("button").first().click();
    await page.getByRole("button", { name: "Validate" }).click();
    await expect(page.getByTestId("feedback")).toBeVisible();
    await page.getByRole("button", { name: "Next question" }).click();
  }
  await expect(page.getByTestId("result")).toContainText("Quiz complete!");
  await page.getByRole("button", { name: "Save my result" }).click();
  await expect(page.getByRole("button", { name: "Result saved" })).toBeVisible();
});

test("the chat modifies a scene and increments the version", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Photosynthesis", exact: true }).click();
  await page.getByRole("button", { name: "Generate video" }).click();
  await expect(page).toHaveURL(/\/p\//, { timeout: 20_000 });
  await expect(page.getByTestId("version")).toContainText("Version 1", { timeout: 20_000 });

  await page.getByLabel("Ask for a change").fill("Shorter");
  await page.getByRole("button", { name: "Send change" }).click();
  await expect(page.getByTestId("version")).toContainText("Version 2", { timeout: 20_000 });
  await expect(page.getByTestId("chat-thread")).toContainText("shortened");
});
