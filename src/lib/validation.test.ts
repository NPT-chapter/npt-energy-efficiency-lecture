import { describe, it, expect } from "vitest";
import { normalizePhone, isValidFullName, generateAttendanceCode, registrationSchema } from "./validation";

describe("phone", () => {
  it("normalizes local and international Egyptian formats to the same value", () => {
    expect(normalizePhone("01012345678")).toBe("+201012345678");
    expect(normalizePhone("+20 101 234 5678")).toBe("+201012345678");
    expect(normalizePhone("00201012345678")).toBe("+201012345678");
    expect(normalizePhone("201012345678")).toBe("+201012345678");
  });
  it("rejects invalid numbers", () => {
    expect(normalizePhone("01312345678")).toBeNull();
    expect(normalizePhone("12345")).toBeNull();
  });
});

describe("name", () => {
  it("requires three or four parts", () => {
    expect(isValidFullName("Ahmed Ali")).toBe(false);
    expect(isValidFullName("Ahmed Ali Hassan")).toBe(true);
    expect(isValidFullName("أحمد علي حسن محمود")).toBe(true);
    expect(isValidFullName("a b c d e")).toBe(false);
  });
});

describe("attendance code", () => {
  it("is 8 uppercase unambiguous characters", () => {
    for (let i = 0; i < 50; i++) expect(generateAttendanceCode()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });
});

describe("student code rule", () => {
  const base = { fullName: "Ahmed Ali Hassan", academicYear: "first", discoverySource: "whatsapp", phone: "01012345678", email: "a@b.com" } as const;
  it("is optional when the student has no code", () => {
    expect(registrationSchema.safeParse({ ...base, hasStudentCode: false, studentCode: null }).success).toBe(true);
  });
  it("is required when the student has a code", () => {
    expect(registrationSchema.safeParse({ ...base, hasStudentCode: true, studentCode: "" }).success).toBe(false);
  });
});
