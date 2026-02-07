import { getAuthService } from "../services";
import { requireAuth } from "../auth/authorization";
import { logSuccess } from "../audit";
import { caseModel } from "../models/caseModel";
import { emailModel } from "../models/emailModel";
import { eventModel } from "../models/eventModel";
import { contactModel } from "../models/contactModel";
import { categoryModel } from "../models/categoryModel";
import { profileModel } from "../models/profileModel";
import { documentModel } from "../models/documentModel";
import type { CaseDocument } from "../models/documentModel";
import type { Profile, Case, Email, Event, Contact, Category } from "../models/types";

/** Shape of the data we export (GDPR Art. 20). */
export interface ExportPayload {
  exported_at: string;
  user_id: string;
  profile: Profile | null;
  cases: Case[];
  emails: Email[];
  events: Event[];
  contacts: Contact[];
  categories: Category[];
  documents: CaseDocument[];
}

function formatExportAsText(payload: ExportPayload): string {
  const lines: string[] = [];
  lines.push("Case Chronicles – Data export (GDPR Art. 20 - data portability)");
  lines.push("Exported at: " + payload.exported_at);
  lines.push("User ID: " + payload.user_id);
  lines.push("");

  lines.push("=== PROFILE ===");
  if (payload.profile) {
    const p = payload.profile;
    const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ") || "—";
    lines.push("Name: " + fullName);
    lines.push("Email: " + (p.email ?? "—"));
    lines.push("");
  } else {
    lines.push("(none)");
    lines.push("");
  }

  lines.push("=== CASES ===");
  if (payload.cases.length === 0) lines.push("(none)");
  payload.cases.forEach((c: Case, i: number) => {
    lines.push(`${i + 1}. ${c.title}`);
    lines.push("   Number: " + (c.number ?? "—") + " | Client: " + (c.client ?? "—") + " | Status: " + c.status);
    lines.push("   Created: " + (c.date_created ?? "—"));
  });
  lines.push("");

  lines.push("=== EMAILS ===");
  if (payload.emails.length === 0) lines.push("(none)");
  payload.emails.forEach((e: Email, i: number) => {
    lines.push(`${i + 1}. ${e.subject ?? "(no subject)"}`);
    lines.push("   From: " + (e.sender ?? "—") + " | Date: " + (e.date ?? "—"));
    if (e.content) lines.push("   Preview: " + String(e.content).slice(0, 120) + (String(e.content).length > 120 ? "…" : ""));
  });
  lines.push("");

  lines.push("=== EVENTS ===");
  if (payload.events.length === 0) lines.push("(none)");
  payload.events.forEach((e: Event, i: number) => {
    lines.push(`${i + 1}. ${e.title ?? "(no title)"}`);
    lines.push("   Date: " + (e.date ?? "—") + " | Time: " + (e.time ?? "—"));
  });
  lines.push("");

  lines.push("=== CONTACTS ===");
  if (payload.contacts.length === 0) lines.push("(none)");
  payload.contacts.forEach((c: Contact, i: number) => {
    lines.push(`${i + 1}. ${c.name ?? "—"} (${c.email ?? "—"})`);
  });
  lines.push("");

  lines.push("=== CATEGORIES ===");
  if (payload.categories.length === 0) lines.push("(none)");
  payload.categories.forEach((c: Category, i: number) => {
    lines.push(`${i + 1}. ${c.name ?? "—"}`);
  });
  lines.push("");

  lines.push("=== DOCUMENTS ===");
  if (payload.documents.length === 0) lines.push("(none)");
  payload.documents.forEach((d: CaseDocument, i: number) => {
    lines.push(`${i + 1}. ${d.filename} (case: ${d.case_id}) – ${d.uploaded_at ?? "—"}`);
  });

  return lines.join("\n");
}

/**
 * GDPR Art. 20 - Data portability: Export all user data as JSON or human-readable text.
 */
export const dataExportController = {
  /**
   * Export format: "json" (machine-readable, for portability) or "text" (human-readable).
   */
  async exportUserData(format: "json" | "text" = "json"): Promise<string> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const [cases, emails, events, contacts, categories, profile] =
      await Promise.all([
        caseModel.getCases(),
        emailModel.getAllEmails(),
        eventModel.getAllEvents(),
        contactModel.getAllContacts(),
        categoryModel.getAllCategories(),
        profileModel.getCurrentProfile(),
      ]);

    const documentPromises = cases.map((c) =>
      documentModel.getDocumentsByCase(c.id)
    );
    const documentsByCase = await Promise.all(documentPromises);
    const documents = documentsByCase.flat();

    const exportData: ExportPayload = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      profile,
      cases,
      emails,
      events,
      contacts,
      categories,
      documents,
    };

    await logSuccess(user.id, "data_export", {
      resource_type: "user",
      resource_id: user.id,
    });

    if (format === "text") {
      return formatExportAsText(exportData);
    }
    return JSON.stringify(exportData, null, 2);
  },
};
