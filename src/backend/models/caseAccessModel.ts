import { getDatabaseService } from "../services";

// --- Timeout Utility ---
function timeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database request timeout")), ms)
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

    const db = getDatabaseService();

    // --- Access Entry Lookup ---
    const accessResult = await timeout(
      db
        .from<CaseAccessCode>("case_access_codes")
        .select("*")
        .eq("code", code)
        .maybeSingle()
    );

    const { data: accessEntry, error: accessError } = accessResult;

    if (accessError || !accessEntry) {
      console.error("[Model] Invalid or expired access code", { accessError, accessEntry });
      return null;
    }

    const caseId = accessEntry.case_id;
    console.log("[Model] Access granted. Fetching case ID:", caseId);

    // --- Case Lookup ---
    const caseResult = await timeout(
      db
        .from<Case>("cases")
        .select("*")
        .eq("id", caseId)
        .maybeSingle()
    );

    const { data: caseData, error: caseError } = caseResult;

    if (caseError || !caseData) {
      console.error("[Model] Case not found", { caseError, caseData });
      return null;
    }

    console.log("[Model] Case data found:", caseData);

    // --- Related Emails & Events ---
    const [emailsRes, eventsRes] = await Promise.all([
      timeout(
        db
          .from<Email>("emails")
          .select("*")
          .eq("case_id", caseId)
          .order("date", { ascending: false })
          .execute()
      ),
      timeout(
        db
          .from<Event>("events")
          .select("*")
          .eq("case_id", caseId)
          .order("date", { ascending: false })
          .execute()
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
