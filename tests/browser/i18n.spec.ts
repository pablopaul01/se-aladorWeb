import { test, expect, type BrowserContext } from "@playwright/test";

async function session(context: BrowserContext, id: string, locale?: string) {
  const now = Math.floor(Date.now() / 1000);
  const user = { id, email: "reader@example.invalid", user_metadata: { locale }, aud: "authenticated", role: "authenticated", app_metadata: {}, created_at: "2026-10-16T00:00:00Z" };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const jwt = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, exp: now + 3600, iat: now, role: "authenticated", user_metadata: { locale } })}.test-signature`;
  await context.addCookies([{ name: "sb-127-auth-token", value: "base64-" + encode({ access_token: jwt, refresh_token: "test-refresh", expires_at: now + 3600, expires_in: 3600, token_type: "bearer", user }), domain: "localhost", path: "/" }]);
}

test("login defaults to Spanish, switches without losing fields, and survives reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { name: "Te damos la bienvenida." })).toBeVisible();
  await page.getByLabel("Correo electrónico").fill("draft@example.invalid");
  await page.getByLabel("Idioma", { exact: true }).selectOption("en");
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveValue("draft@example.invalid");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  expect(page.url()).toMatch(/\/login$/);
  expect(errors).toEqual([]);
});

test("desktop sidebar persists account preference across independent devices and preserves filters", async ({ browser }) => {
  const account = "00000000-0000-4000-8000-000000000001";
  const first = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await session(first, account, "en");
  await first.addCookies([{ name: "senalador-locale", value: "en", domain: "localhost", path: "/" }]);
  const page = await first.newPage();
  await page.goto("/");
  // Legacy account has no saved preference: both stale JWT and anonymous cookie lose.
  await expect(page.getByRole("heading", { name: "Tu propia biblioteca." })).toBeVisible();
  await page.getByRole("button", { name: "Terminados" }).click();
  await page.locator("aside").getByLabel("Idioma", { exact: true }).selectOption("en");
  await expect(page.getByRole("heading", { name: "No finished books yet" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "All books" }).click();
  await expect(page.getByRole("button", { name: "Open The Original Title" })).toBeVisible();
  const second = await browser.newContext();
  await session(second, account, "es");
  const other = await second.newPage();
  await other.goto("/");
  await expect(other.getByRole("heading", { name: "A shelf of your own." })).toBeVisible();
  await expect(other.locator("html")).toHaveAttribute("lang", "en");
  await expect(other).toHaveTitle("Señalador — A place for your next chapter");
  expect(other.url()).toMatch(/\/$/);
  await first.close();
  await second.close();
});

test("mobile user menu switches language and dialogs translate without modifying book data", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await session(context, "00000000-0000-4000-8000-000000000002");
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú de usuario" }).filter({ visible: true }).click();
  await page.getByLabel("Idioma", { exact: true }).filter({ visible: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open The Original Title" }).click();
  await expect(page.getByRole("dialog")).toContainText("Original Author");
  await page.getByRole("button", { name: "Save my place" }).click();
  await expect(page.getByRole("dialog")).toContainText("Pick up where you left off in The Original Title.");
  await expect(page.getByLabel("Chapter or section")).toHaveValue("Chapter One");
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue("Original note");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await context.close();
});
