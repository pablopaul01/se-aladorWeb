import { test, expect } from "@playwright/test";

test("multiple notes are independent from progress and legacy notes require a location", async ({ page, context }) => {
  const id = "00000000-0000-4000-8000-000000000003";
  const now = Math.floor(Date.now() / 1000);
  const user = { id, email: "reader@example.invalid", user_metadata: {}, aud: "authenticated", role: "authenticated", app_metadata: {}, created_at: "2026-10-16T00:00:00Z" };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const jwt = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, exp: now + 3600, iat: now, role: "authenticated" })}.test-signature`;
  await context.addCookies([{ name: "sb-127-auth-token", value: "base64-" + encode({ access_token: jwt, refresh_token: "test-refresh", expires_at: now + 3600, expires_in: 3600, token_type: "bearer", user }), domain: "localhost", path: "/" }]);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  // The development-only Next.js badge can overlap bottom-sheet actions.
  await page.addStyleTag({ content: "nextjs-portal { display: none; }" });
  await page.getByRole("button", { name: "Abrir The Original Title" }).click();
  const notes = page.getByRole("region", { name: "Notas", exact: true });
  await expect(notes).toContainText("Original note");
  await expect(notes).toContainText("Ubicación pendiente");

  await notes.getByRole("button", { name: "Editar nota", exact: true }).click();
  await expect(page.getByLabel("Nota", { exact: true })).toHaveValue("Original note");
  await page.getByRole("button", { name: "Guardar nota", exact: true }).click();
  await expect(page.getByLabel("Tipo de ubicación")).toHaveValue("");
  await page.getByLabel("Tipo de ubicación").selectOption("reference");
  await page.getByLabel("Referencia", { exact: true }).fill("Juan 1, 4-5");
  await page.getByRole("button", { name: "Guardar nota", exact: true }).click();
  await expect(notes).toContainText("Juan 1, 4-5");
  await expect(notes).not.toContainText("Ubicación pendiente");
  await expect(page.getByRole("dialog")).toContainText("Página 12 de 300");

  await notes.getByRole("button", { name: "Añadir nota", exact: true }).click();
  await page.getByLabel("Nota", { exact: true }).fill("Range thought");
  await page.getByLabel("Tipo de ubicación").selectOption("range");
  await page.getByLabel("Página inicial").fill("42");
  await page.getByLabel("Página final").fill("40");
  await page.getByRole("button", { name: "Guardar nota", exact: true }).click();
  await expect(page.getByText("La página final debe ser mayor que la página inicial.")).toBeVisible();
  await expect(page.getByLabel("Nota", { exact: true })).toHaveValue("Range thought");
  await page.getByLabel("Página final").fill("48");
  await page.getByRole("button", { name: "Guardar nota", exact: true }).click();
  await expect(notes).toContainText("Páginas 42–48");

  await notes.getByRole("button", { name: "Añadir nota", exact: true }).click();
  await page.getByLabel("Nota", { exact: true }).fill("Page thought");
  await page.getByLabel("Tipo de ubicación").selectOption("page");
  await page.getByLabel("Página", { exact: true }).fill("60");
  await page.getByRole("button", { name: "Guardar nota", exact: true }).click();
  await expect(notes.getByRole("listitem")).toHaveCount(3);
  await expect(notes).toContainText("Página 60");
  await expect(page.getByRole("dialog")).toContainText("Página 12 de 300");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: "Guardar mi lugar", exact: true }).click();
  await expect(page.getByLabel("Nota", { exact: true })).toHaveCount(0);
  await page.getByLabel("Página (opcional)", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Guardar mi lugar", exact: true }).click();
  await page.getByRole("button", { name: "Abrir The Original Title" }).click();
  await expect(page.getByRole("dialog")).toContainText("Página 20 de 300");
  await expect(notes.getByRole("listitem")).toHaveCount(3);
  await expect(notes).toContainText("Páginas 42–48");

  page.once("dialog", dialog => dialog.accept());
  await notes.getByRole("listitem").filter({ hasText: "Range thought" }).getByRole("button", { name: "Eliminar nota", exact: true }).click();
  await expect(notes.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Buscar", exact: true }).filter({ visible: true }).click();
  await page.getByRole("searchbox").fill("Juan 1, 4-5");
  await expect(page.getByRole("button", { name: "Abrir The Original Title" })).toBeVisible();
  await page.getByRole("searchbox").fill("Range thought");
  await expect(page.getByRole("heading", { name: "No hay libros que coincidan con la búsqueda" })).toBeVisible();
  expect(errors).toEqual([]);
});
