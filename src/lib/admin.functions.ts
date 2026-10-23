import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: { rpc: (...a: any[]) => any }; userId: string };

async function assertOrganizer(context: Ctx) {
  const [a, o] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "organizer" }),
  ]);
  if (!a.data && !o.data) throw new Error("Forbidden");
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertOrganizer(context as unknown as Ctx);
      return { organizer: true };
    } catch {
      return { organizer: false };
    }
  });

const listSchema = z.object({
  search: z.string().max(100).default(""),
  year: z.string().max(20).default(""),
  source: z.string().max(30).default(""),
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(5000).default(20),
});

export const listRegistrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertOrganizer(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("registrations")
      .select("id, full_name, student_code, has_student_code, academic_year, discovery_source, phone, email, attendance_code, checked_in_at, created_at", { count: "exact" })
      .order("created_at", { ascending: false });
    if (data.year) q = q.eq("academic_year", data.year);
    if (data.source) q = q.eq("discovery_source", data.source);
    if (data.search) {
      const s = data.search.replace(/[,%()*]/g, "");
      q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,student_code.ilike.%${s}%,attendance_code.ilike.%${s}%`);
    }
    const from = data.page * data.pageSize;
    const { data: rows, count, error } = await q.range(from, from + data.pageSize - 1);
    if (error) throw new Error("Failed to load");
    return { rows: rows ?? [], count: count ?? 0 };
  });

export const getStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertOrganizer(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("registrations").select("academic_year, discovery_source, checked_in_at").limit(10000);
    const rows = data ?? [];
    const byYear: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let checkedIn = 0;
    for (const r of rows) {
      byYear[r.academic_year] = (byYear[r.academic_year] ?? 0) + 1;
      bySource[r.discovery_source] = (bySource[r.discovery_source] ?? 0) + 1;
      if (r.checked_in_at) checkedIn++;
    }
    return { total: rows.length, checkedIn, byYear, bySource };
  });

export const checkInCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().trim().toUpperCase().max(20) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOrganizer(context as unknown as Ctx);
    if (!/^[A-Z0-9]{8}$/.test(data.code)) return { status: "invalid" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated } = await supabaseAdmin
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString(), checked_in_by: context.userId })
      .eq("attendance_code", data.code)
      .is("checked_in_at", null)
      .select("full_name, academic_year")
      .maybeSingle();
    if (updated) return { status: "valid" as const, fullName: updated.full_name, academicYear: updated.academic_year };
    const { data: existing } = await supabaseAdmin
      .from("registrations")
      .select("full_name, checked_in_at")
      .eq("attendance_code", data.code)
      .maybeSingle();
    if (existing) return { status: "used" as const, fullName: existing.full_name, checkedInAt: existing.checked_in_at };
    return { status: "invalid" as const };
  });
