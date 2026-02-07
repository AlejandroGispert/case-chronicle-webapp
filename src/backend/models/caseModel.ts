import { getDatabaseService, getAuthService } from "../services";
import { Case, CaseWithRelations, CreateCaseInput } from "./types";

export const caseModel = {
  async getCases(): Promise<Case[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Case>("cases")
      .select("*")
      .eq("user_id", user.id)
      .order("date_created", { ascending: false })
      .limit(500)
      .execute();

    if (error) {
      console.error("Error fetching cases:", error);
      return [];
    }

    return data || [];
  },

  async getCasesByStatus(status: string): Promise<Case[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Case>("cases")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", status)
      .order("date_created", { ascending: false })
      .limit(500)
      .execute();

    if (error) {
      console.error(`Error fetching ${status} cases:`, error);
      return [];
    }

    return data || [];
  },

  async getCaseWithRelations(
    caseId: string,
  ): Promise<CaseWithRelations | null> {
    console.log("Fetching case with ID:", caseId);
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    const db = getDatabaseService();

    // Get the case
    const { data: caseData, error: caseError } = await db
      .from<Case>("cases")
      .select("*")
      .eq("id", caseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (caseError) {
      console.error("Error fetching case:", caseError);
      return null;
    }

    if (!caseData) {
      console.error("No case data found for ID:", caseId);
      return null;
    }

    console.log("Found case data:", caseData);

    // Get emails for this case
    const { data: emails, error: emailsError } = await db
      .from("emails")
      .select("*")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .execute();

    if (emailsError) {
      console.error("Error fetching case emails:", emailsError);
      return null;
    }

    console.log("Found emails:", emails);

    // Get events for this case
    const { data: events, error: eventsError } = await db
      .from("events")
      .select("*")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .execute();

    if (eventsError) {
      console.error("Error fetching case events:", eventsError);
      return null;
    }

    console.log("Found events:", events);

    // Parse attachments: Supabase may return JSON as string or already-parsed object
    const processedEmails = (emails || []).map((email) => {
      let attachments: unknown[] = [];
      if (email.attachments != null) {
        try {
          attachments = typeof email.attachments === "string"
            ? (JSON.parse(email.attachments) as unknown[])
            : Array.isArray(email.attachments)
              ? email.attachments
              : [];
        } catch {
          attachments = [];
        }
      }
      return { ...email, attachments };
    });

    const processedResult = {
      ...caseData,
      emails: processedEmails,
      events: events || [],
    };

    console.log("Returning case with relations:", processedResult);
    return processedResult;
  },

  async createCase(caseData: CreateCaseInput): Promise<Case | null> {
    try {
      console.log("Attempting to create a case with data:", caseData);

      const db = getDatabaseService();

      // Ensure we always have a case number and client name before inserting.
      const now = new Date();
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const timePart = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const randomPart = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

      const generatedNumber = `C-${datePart}-${timePart}-${randomPart}`;

      const preparedCaseData: CreateCaseInput & {
        number: string;
        client: string;
        date_created: string;
      } = {
        ...caseData,
        number: (caseData.number || "").trim() || generatedNumber,
        client: (caseData.client || "").trim(),
        date_created: caseData.date_created || now.toISOString(),
      };

      const result = await db
        .from<Case>("cases")
        .insert(preparedCaseData)
        .select()
        .single();

      if (result.error) {
        console.error("Error creating case:", result.error);
        return null;
      }

      console.log("Case created successfully:", result.data);
      return result.data;
    } catch (err) {
      console.error("Unexpected error creating case:", err);
      return null;
    }
  },

  async updateCase(
    caseId: string,
    updates: Partial<Case>,
  ): Promise<Case | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return null;

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Case>("cases")
      .update(updates)
      .eq("id", caseId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating case:", error);
      return null;
    }

    return data;
  },

  async deleteCase(caseId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return false;

    const db = getDatabaseService();
    const { error } = await db
      .from("cases")
      .delete()
      .eq("id", caseId)
      .eq("user_id", user.id)
      .execute();

    if (error) {
      console.error("Error deleting case:", error);
      return false;
    }

    return true;
  },

  async getSharedCases(): Promise<Case[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];

    const db = getDatabaseService();
    const sharedCaseIds = new Set<string>();

    // Get cases shared with current user via case_shares table
    try {
      const { data: shares, error: sharesError } = await db
        .from("case_shares")
        .select("case_id")
        .eq("shared_with_user_id", user.id)
        .execute();

      if (!sharesError && shares) {
        shares.forEach((s: { case_id: string }) =>
          sharedCaseIds.add(s.case_id),
        );
      }
    } catch (error) {
      // Table might not exist yet, continue with access codes
      console.warn(
        "case_shares table might not exist, using access codes only",
      );
    }

    // Also get cases that have access codes (are shared) and are not owned by the current user
    const { data: accessCodes, error: accessError } = await db
      .from("case_access_codes")
      .select("case_id")
      .execute();

    if (!accessError && accessCodes) {
      accessCodes.forEach((ac: { case_id: string }) => {
        sharedCaseIds.add(ac.case_id);
      });
    }

    if (sharedCaseIds.size === 0) {
      return [];
    }

    // Get cases that are shared but not owned by current user
    const { data: sharedCases, error: casesError } = await db
      .from<Case>("cases")
      .select("*")
      .in("id", Array.from(sharedCaseIds))
      .neq("user_id", user.id)
      .order("date_created", { ascending: false })
      .execute();

    if (casesError) {
      console.error("Error fetching shared cases:", casesError);
      return [];
    }

    return sharedCases || [];
  },
};
