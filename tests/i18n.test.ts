import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AuthSessionMissingError, type User, type UserResponse } from "@supabase/supabase-js";
import { bookCount, normalizeLocale, resolveLocale, translate } from "../src/lib/i18n/core";
import { es } from "../src/lib/i18n/messages";
import { persistAccountLocale } from "../src/lib/i18n/account";
import { bookDetailsSchema, credentialsSchema, locationSchema, noteSchema, registrationSchema } from "../src/lib/validation";

test("Spanish is the default, not the browser language", () => {
  for (const invalid of [null, undefined, "fr", "EN", "", {}, 1]) assert.equal(normalizeLocale(invalid), "es");
  assert.equal(normalizeLocale("en"), "en");
});
test("account preference wins over anonymous cookies, including legacy accounts", () => {
  assert.equal(resolveLocale({ user_metadata: { locale: "en" } }, "es"), "en");
  assert.equal(resolveLocale({ user_metadata: { locale: "es" } }, "en"), "es");
  assert.equal(resolveLocale({ user_metadata: {} }, "en"), "es");
  assert.equal(resolveLocale({ user_metadata: { locale: "xx" } }, "en"), "es");
  assert.equal(resolveLocale(null, "en"), "en");
  assert.equal(resolveLocale(null, undefined), "es");
});
test("interpolation preserves user text and locale-aware counts", () => {
  assert.equal(translate("es", "Open {title}", { title: "The {book} <test>" }), "Abrir The {book} <test>");
  assert.equal(translate("en", "Page {page} of {total}", { page: 12, total: 300 }), "Page 12 of 300");
  assert.equal(translate("es", "Page {page} of {total}", { page: 12, total: 300 }), "Página 12 de 300");
  assert.equal(bookCount("es", 0), "0 libros");
  assert.equal(bookCount("es", 1), "1 libro");
  assert.equal(bookCount("en", 2), "2 books");
});
test("dictionary has nonempty ES/EN messages and matching placeholders", () => {
  for (const [key, value] of Object.entries(es)) {
    assert.ok(value.trim(), key);
    const tokens = (text: string) => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
    assert.deepEqual(tokens(key), tokens(value), key);
    assert.equal(translate("en", key), key);
  }
});
function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? sourceFiles(join(path, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(path, entry.name)] : []);
}
test("all explicit UI, action, and validation message keys have translations", () => {
  for (const file of sourceFiles("src")) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/(?:\bt\(|\bmessage:\s*|\btranslate\(locale,\s*)"([^"\n]+)"/g)) {
      if (match[1]) assert.ok(match[1] in es, `${file}: ${match[1]}`);
    }
  }
  for (const schema of [bookDetailsSchema, credentialsSchema, locationSchema, noteSchema, registrationSchema]) {
    for (const input of [{}, { title: "", total_pages: "1.2", email: "bad", password: "", confirm_password: "different" }, { title: "x", author: "a".repeat(201), current_section: "x".repeat(201), note: "x".repeat(2001) }]) {
      const result = schema.safeParse(input);
      if (!result.success) for (const issue of result.error.issues) assert.notEqual(translate("es", issue.message), issue.message);
    }
  }
});
const user: User = { id: "test-account", user_metadata: { locale: "es" }, app_metadata: {}, aud: "authenticated", created_at: "2026-10-16T00:00:00Z" };
function fakeAuth(response: UserResponse, failUpdate = false) {
  const updates: unknown[] = [];
  return { updates, getUser: async () => response, updateUser: async (value: unknown) => {
    updates.push(value);
    return { data: { user: failUpdate ? null : user }, error: failUpdate ? new Error("offline") : null };
  } };
}
test("saving language updates only current verified account metadata", async () => {
  const auth = fakeAuth({ data: { user }, error: null });
  assert.equal(await persistAccountLocale(auth, "en", true), true);
  assert.deepEqual(auth.updates, [{ data: { locale: "en" } }]);
});
test("anonymous selection does not create/update an account", async () => {
  const auth = fakeAuth({ data: { user: null }, error: new AuthSessionMissingError() });
  assert.equal(await persistAccountLocale(auth, "en", false), true);
  assert.deepEqual(auth.updates, []);
});
test("expired session and failed account saves never succeed as anonymous", async () => {
  const missing = fakeAuth({ data: { user: null }, error: new AuthSessionMissingError() });
  assert.equal(await persistAccountLocale(missing, "en", true), false);
  assert.deepEqual(missing.updates, []);
  const failed = fakeAuth({ data: { user }, error: null }, true);
  assert.equal(await persistAccountLocale(failed, "en", true), false);
});
test("fresh account data overrides stale session metadata across devices", () => {
  const staleCookie = "es";
  assert.equal(resolveLocale({ user_metadata: { locale: "en" } }, staleCookie), "en");
});
