import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max, `Use no more than ${max} characters.`).transform((value) => value || null);
const page = z.preprocess(
  (value) => value === "" || value === null || value === undefined ? null : value,
  z.union([z.null(), z.coerce.number({ error: "Use a whole page number." }).int("Use a whole page number.").min(1, "Pages start at 1.").max(1_000_000, "The page number is too large.")]),
);

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email address.").max(254, "Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password.").max(128, "Use no more than 128 characters."),
});

export const registrationSchema = credentialsSchema.extend({
  password: z.string().min(8, "Use at least 8 characters.").max(128, "Use no more than 128 characters."),
  confirm_password: z.string(),
}).refine((value) => value.password === value.confirm_password, {
  message: "Your passwords do not match.",
  path: ["confirm_password"],
});

export const bookDetailsSchema = z.object({
  title: z.string().trim().min(1, "Enter a book title.").max(200, "Use no more than 200 characters."),
  author: optionalText(200),
  total_pages: page,
});

export const locationSchema = z.object({
  current_page: page,
  current_section: optionalText(200),
  note: optionalText(2000),
});

export const bookIdSchema = z.uuid();
export const statusSchema = z.enum(["reading", "finished"]);

export function isPageWithinBook(current: number | null, total: number | null) {
  return current === null || total === null || current <= total;
}
