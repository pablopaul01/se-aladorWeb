import assert from "node:assert/strict";
import test from "node:test";
import { locationSchema, noteSchema } from "../src/lib/validation";

const content = "A thought to remember";

test("notes support a page, a page range, or an arbitrary reference", () => {
  assert.deepEqual(noteSchema.parse({ content, reference_type: "page", page_start: "42" }), {
    content, reference_type: "page", page_start: 42, page_end: null, reference: null,
  });
  assert.deepEqual(noteSchema.parse({ content, reference_type: "range", page_start: "42", page_end: "48" }), {
    content, reference_type: "range", page_start: 42, page_end: 48, reference: null,
  });
  for (const reference of ["Capítulo 4", "Juan 1, 4-5"]) {
    assert.deepEqual(noteSchema.parse({ content, reference_type: "reference", reference }), {
      content, reference_type: "reference", page_start: null, page_end: null, reference,
    });
  }
});

test("new or edited notes cannot be unlocated, pending, empty, or invalid", () => {
  const invalid = [
    {}, { content }, { content, reference_type: "pending" },
    { content, reference_type: "page" },
    { content, reference_type: "reference", reference: " \n " },
    { content, reference_type: "range", page_start: "42" },
    ...["0", "-1", "1.5", "1000001", "abc"].map(page_start => ({ content, reference_type: "page", page_start })),
    ...["41", "42", "0", "1.5"].map(page_end => ({ content, reference_type: "range", page_start: "42", page_end })),
    { content: " \n ", reference_type: "page", page_start: "1" },
    { content: "x".repeat(2001), reference_type: "page", page_start: "1" },
    { content, reference_type: "reference", reference: "x".repeat(201) },
  ];
  for (const input of invalid) assert.equal(noteSchema.safeParse(input).success, false, JSON.stringify(input));
});

test("note payloads strip bookmark fields and normalize unused reference fields", () => {
  assert.deepEqual(noteSchema.parse({ content: ` ${content} `, reference_type: "reference", reference: " Juan 1, 4-5 ", current_page: "100", current_section: "New chapter", user_id: "other-user", page_start: "12", page_end: "15" }), {
    content, reference_type: "reference", reference: "Juan 1, 4-5", page_start: null, page_end: null,
  });
});

test("progress payloads cannot contain or overwrite notes", () => {
  assert.deepEqual(locationSchema.parse({ current_page: "12", current_section: "Chapter One", note: "Old field", content: "New note" }), {
    current_page: 12, current_section: "Chapter One",
  });
});
