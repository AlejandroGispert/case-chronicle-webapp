import { supabase } from "@/integrations/supabase/client";

export const caseAccessModel = {
  async getCaseByAccessCode(code: string) {
    // Lookup access code
    const { data: accessEntry, error: accessError } = await supabase
      .from("case_access_codes")
      .select("*")
      .eq("access_code", code)
      .maybeSingle();

    if (accessError || !accessEntry) {
      console.error("Invalid or expired access code:", code);
      return null;
    }

    // Lookup case
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", accessEntry.case_id)
      .maybeSingle();

    if (caseError || !caseData) {
      console.error("No case found for access code:", code);
      return null;
    }

    return caseData;
  },

  async getCaseWithRelationsByAccessCode(code: string) {
    const { data: accessEntry, error: accessError } = await supabase
      .from("case_access_codes")
      .select("*")
      .eq("access_code", code)
      .maybeSingle();

    if (accessError || !accessEntry) {
      console.error("Invalid access code");
      return null;
    }

    const caseId = accessEntry.case_id;

    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .maybeSingle();

    if (caseError || !caseData) return null;

    const [emails, events] = await Promise.all([
      supabase.from("emails").select("*").eq("case_id", caseId).order("date", { ascending: false }),
      supabase.from("events").select("*").eq("case_id", caseId).order("date", { ascending: false }),
    ]);

    return {
      ...caseData,
      emails: emails.data || [],
      events: events.data || []
    };
  }
};
