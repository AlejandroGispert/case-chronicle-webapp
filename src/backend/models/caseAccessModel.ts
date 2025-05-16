import { supabase } from "@/integrations/supabase/client";

// --- Timeout Utility ---
function timeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase request timeout")), ms)
    ),
  ]);
}

// --- Types (adjust if your DB differs) ---
type CaseAccessCode = {
  code: string;
  case_id: string;
  created_at: string;
};

type Case = {
  id: string;
  title: string;
  number: string;
  status: string;
  client: string;
  date_created: string;
  updated_at: string;
  user_id: string;
};

type Email = {
  id: string;
  case_id: string;
  subject: string;
  body: string;
  date: string;
};

type Event = {
  id: string;
  case_id: string;
  description: string;
  date: string;
};

export const caseAccessModel = {
  async getCaseWithRelationsByAccessCode(code: string) {
    console.log("[Model] Fetching access entry for code:", code);

    // --- Access Entry Lookup ---
    const { data: accessEntry, error: accessError }: {
      data: CaseAccessCode | null;
      error: any;
    } = await timeout(
      supabase
        .from("case_access_codes")
        .select("*")
        .eq("code", code)
        .maybeSingle()
    );

    if (accessError || !accessEntry) {
      console.error("[Model] Invalid or expired access code", { accessError, accessEntry });
      return null;
    }

    const caseId = accessEntry.case_id;
    console.log("[Model] Access granted. Fetching case ID:", caseId);

    // --- Case Lookup ---
    const { data: caseData, error: caseError }: {
      data: Case | null;
      error: any;
    } = await timeout(
      supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .maybeSingle()
    );

    if (caseError || !caseData) {
      console.error("[Model] Case not found", { caseError, caseData });
      return null;
    }

    console.log("[Model] Case data found:", caseData);

    // --- Related Emails & Events ---
    const [emailsRes, eventsRes]: [
      { data: Email[] | null; error: any },
      { data: Event[] | null; error: any }
    ] = await Promise.all([
      timeout(
        supabase
          .from("emails")
          .select("*")
          .eq("case_id", caseId)
          .order("date", { ascending: false })
      ),
      timeout(
        supabase
          .from("events")
          .select("*")
          .eq("case_id", caseId)
          .order("date", { ascending: false })
      ),
    ]);

    if (emailsRes.error || eventsRes.error) {
      console.error("[Model] Related data fetch errors", {
        emailError: emailsRes.error,
        eventError: eventsRes.error,
      });
    }

    console.log("[Model] Emails and events fetched:", {
      emails: emailsRes.data,
      events: eventsRes.data,
    });

    return {
      ...caseData,
      emails: emailsRes.data || [],
      events: eventsRes.data || [],
    };
  },
};
