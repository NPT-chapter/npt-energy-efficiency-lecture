import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  registrationSchema,
  normalizeEmail,
  normalizeName,
  normalizePhone,
  normalizeStudentCode,
  generateAttendanceCode,
} from "./validation";

export type DuplicateField = "email" | "phone" | "student_code" | "unknown";

type UniqueConflictField = DuplicateField | "attendance_code";

export type RegisterResult =
  | { status: "ok"; fullName: string; attendanceCode: string }
  | { status: "duplicate"; field: DuplicateField }
  | { status: "rate_limited" }
  | { status: "invalid" }
  | { status: "error" };

async function clientIp(): Promise<string> {
  const { getRequest } = await import("@tanstack/react-start/server");
  const h = getRequest()?.headers;
  return (
    h?.get("cf-connecting-ip") ?? h?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function uniqueConflictField(message: string): UniqueConflictField {
  const constraint = message.toLowerCase();
  if (constraint.includes("registrations_attendance_code_key")) return "attendance_code";
  if (constraint.includes("registrations_email_key")) return "email";
  if (constraint.includes("registrations_phone_key")) return "phone";
  if (constraint.includes("registrations_student_code_uq")) return "student_code";
  return "unknown";
}

export const registerStudent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d)
  .handler(async ({ data }): Promise<RegisterResult> => {
    const parsed = registrationSchema.safeParse(data);
    if (!parsed.success) return { status: "invalid" };
    const v = parsed.data;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const ip = await clientIp();
      const { data: ok } = await supabaseAdmin.rpc("hit_rate_limit", {
        _key: `reg:${ip}`,
        _max: 10,
        _window_seconds: 600,
      });
      if (ok === false) return { status: "rate_limited" };

      const row = {
        full_name: normalizeName(v.fullName),
        has_student_code: v.hasStudentCode,
        student_code: v.hasStudentCode ? normalizeStudentCode(v.studentCode ?? "") : null,
        academic_year: v.academicYear,
        discovery_source: v.discoverySource,
        phone: normalizePhone(v.phone)!,
        email: normalizeEmail(v.email),
      };
      // Unique constraints on email/phone/student code make this concurrency-safe.
      for (let attempt = 0; attempt < 5; attempt++) {
        const attendance_code = generateAttendanceCode();
        const { error } = await supabaseAdmin
          .from("registrations")
          .insert({ ...row, attendance_code });
        if (!error)
          return { status: "ok", fullName: row.full_name, attendanceCode: attendance_code };
        if (error.code === "23505") {
          const field = uniqueConflictField(error.message);
          if (field === "attendance_code") continue;
          return { status: "duplicate", field };
        }
        console.error("register insert failed", error.code);
        return { status: "error" };
      }
      return { status: "error" };
    } catch (e) {
      console.error("register failed");
      return { status: "error" };
    }
  });

export type RecoverResult =
  | { status: "ok"; fullName: string; attendanceCode: string }
  | { status: "not_found" }
  | { status: "rate_limited" }
  | { status: "invalid" }
  | { status: "error" };

export const recoverCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d)
  .handler(async ({ data }): Promise<RecoverResult> => {
    const parsed = z
      .object({ email: z.string().trim().email().max(255), phone: z.string().max(25) })
      .safeParse(data);
    const phone = parsed.success ? normalizePhone(parsed.data.phone) : null;
    if (!parsed.success || !phone) return { status: "invalid" };
    const email = normalizeEmail(parsed.data.email);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const ip = await clientIp();
      const a = await supabaseAdmin.rpc("hit_rate_limit", {
        _key: `rec:${ip}`,
        _max: 5,
        _window_seconds: 900,
      });
      const b = await supabaseAdmin.rpc("hit_rate_limit", {
        _key: `rec:${email}`,
        _max: 5,
        _window_seconds: 900,
      });
      if (a.data === false || b.data === false) return { status: "rate_limited" };
      const { data: r } = await supabaseAdmin
        .from("registrations")
        .select("full_name, attendance_code")
        .eq("email", email)
        .eq("phone", phone)
        .maybeSingle();
      if (!r) return { status: "not_found" };
      return { status: "ok", fullName: r.full_name, attendanceCode: r.attendance_code };
    } catch {
      return { status: "error" };
    }
  });
