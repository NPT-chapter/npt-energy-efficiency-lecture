import { z } from "zod";

export const ACADEMIC_YEARS = ["first", "second", "third", "fourth"] as const;
export const DISCOVERY_SOURCES = ["social_media", "whatsapp", "recommendation"] as const;

/** Normalize an Egyptian mobile number to +201XXXXXXXXX, or null if invalid. */
export function normalizePhone(raw: string): string | null {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  let s = raw.replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)));
  s = s.replace(/[\s\-().]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("+20")) s = s.slice(3);
  else if (s.startsWith("20") && s.length === 12) s = s.slice(2);
  if (s.startsWith("1") && s.length === 10) s = "0" + s;
  if (!/^01[0125]\d{8}$/.test(s)) return null;
  return "+2" + s;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** 3 or 4 name parts, letters only (Arabic or Latin), each part >= 2 chars. */
export function isValidFullName(raw: string): boolean {
  const name = normalizeName(raw);
  const parts = name.split(" ");
  if (parts.length < 3 || parts.length > 4) return false;
  return parts.every((p) => p.length >= 2 && /^[\p{Script=Arabic}\p{Script=Latin}'’-]+$/u.test(p));
}

export function normalizeStudentCode(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

export function isValidStudentCode(code: string): boolean {
  return /^[A-Z0-9-]{3,30}$/.test(code);
}

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAttendanceCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  // 256 % 32 === 0 so modulo is unbiased
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export const registrationSchema = z
  .object({
    fullName: z.string().max(150).refine(isValidFullName, "name"),
    hasStudentCode: z.boolean(),
    studentCode: z.string().max(30).optional().nullable(),
    academicYear: z.enum(ACADEMIC_YEARS),
    discoverySource: z.enum(DISCOVERY_SOURCES),
    phone: z.string().max(25).refine((v) => normalizePhone(v) !== null, "phone"),
    email: z.string().trim().max(255).email("email"),
  })
  .superRefine((v, ctx) => {
    if (v.hasStudentCode) {
      const c = normalizeStudentCode(v.studentCode ?? "");
      if (!isValidStudentCode(c)) ctx.addIssue({ code: "custom", path: ["studentCode"], message: "studentCode" });
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
