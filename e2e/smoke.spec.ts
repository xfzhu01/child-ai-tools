import { test, expect } from "@playwright/test";

test("landing page shows mission", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "6–12 岁小朋友的 AI 高效打字学习" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "定价" })).toBeVisible();
});

test("register page loads", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "创建家长账号" })).toBeVisible();
});
