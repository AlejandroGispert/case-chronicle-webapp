import { supabase } from "@/integrations/supabase/client";

export const caseAccessModel = {
  async getCaseWithRelationsByAccessCode(code: string) {
    console.log("[Model] Fetching access entry for code:", code);

    const { data: accessEntry, error: accessError } = await supabase
      .from("case_access_codes")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (accessError || !accessEntry) {
      console.error("[Model] Invalid or expired access code", { accessError, accessEntry });
      return null;
    }

    const caseId = accessEntry.case_id;
    console.log("[Model] Access granted. Fetching case ID:", caseId);

    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .maybeSingle();

    if (caseError || !caseData) {
      console.error("[Model] Case not found", { caseError, caseData });
      return null;
    }

    console.log("[Model] Case data found:", caseData);

    const [emails, events] = await Promise.all([
      supabase.from("emails").select("*").eq("case_id", caseId).order("date", { ascending: false }),
      supabase.from("events").select("*").eq("case_id", caseId).order("date", { ascending: false }),
    ]);

    console.log("[Model] Emails and events fetched:", {
      emails: emails.data,
      emailError: emails.error,
      events: events.data,
      eventError: events.error,
    });

    return {
      ...caseData,
      emails: emails.data || [],
      events: events.data || [],
    };
  },
};
