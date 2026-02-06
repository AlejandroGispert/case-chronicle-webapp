import { getDatabaseService, getAuthService } from "../services";

type CaseShareInvite = {
  id: string;
  case_id: string;
  email: string;
  invited_by_user_id: string;
  can_view: boolean;
  can_edit: boolean;
  token: string;
  expires_at: string;
  created_at: string;
};

export type PendingInvite = {
  id: string;
  email: string;
  can_view: boolean;
  can_edit: boolean;
  token: string;
  expires_at: string;
  created_at: string;
};

export type InvitePreview = {
  case_title: string;
  case_id: string;
  email: string;
  expires_at: string;
  valid: boolean;
};

export const caseShareInviteModel = {
  /**
   * Create a pending invite when user doesn't exist in profiles
   */
  async createInvite(
    caseId: string,
    email: string,
    permissions: { can_view: boolean; can_edit: boolean },
  ): Promise<{ success: boolean; token?: string; inviteLink?: string; error?: string }> {
    try {
      const authService = getAuthService();
      const { user: currentUser } = await authService.getUser();
      if (!currentUser) {
        return { success: false, error: "Not authenticated" };
      }

      const db = getDatabaseService();
      const normalizedEmail = email.toLowerCase().trim();

      // Verify case exists and belongs to current user
      const { data: caseData, error: caseError } = await db
        .from("cases")
        .select("id, title")
        .eq("id", caseId)
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (caseError || !caseData) {
        return { success: false, error: "Case not found or you do not have permission" };
      }

      // Check if already invited
      const { data: existingInvite } = await db
        .from<CaseShareInvite>("case_share_invites")
        .select("id")
        .eq("case_id", caseId)
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingInvite) {
        return { success: false, error: "An invite has already been sent to this email" };
      }

      // Check if already shared
      const { data: profile } = await db
        .from("profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (profile) {
        return {
          success: false,
          error: "This user already has an account. Use Share to add them directly.",
        };
      }

      const canView = permissions.can_view ?? true;
      const canEdit = permissions.can_edit ?? false;

      const insertResult = await db
        .from<CaseShareInvite>("case_share_invites")
        .insert({
          case_id: caseId,
          email: normalizedEmail,
          invited_by_user_id: currentUser.id,
          can_view: canView,
          can_edit: canEdit,
        })
        .select("token")
        .single();

      const invite = insertResult.data;
      const insertError = insertResult.error;

      if (insertError || !invite) {
        console.error("Error creating invite:", insertError);
        return { success: false, error: "Failed to create invite" };
      }

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const inviteLink = `${baseUrl}/invite/${invite.token}`;

      return {
        success: true,
        token: invite.token,
        inviteLink,
      };
    } catch (error) {
      console.error("Unexpected error creating invite:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  },

  /**
   * Get pending invites for a case (owner only)
   */
  async getPendingInvites(caseId: string): Promise<PendingInvite[]> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) return [];

      const db = getDatabaseService();

      const { data: caseData, error: caseError } = await db
        .from("cases")
        .select("id")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (caseError || !caseData) return [];

      const { data: invites, error } = await db
        .from<CaseShareInvite>("case_share_invites")
        .select("id, email, can_view, can_edit, token, expires_at, created_at")
        .eq("case_id", caseId)
        .gt("expires_at", new Date().toISOString())
        .execute();

      if (error || !invites) return [];
      return invites;
    } catch (error) {
      console.error("Unexpected error getting pending invites:", error);
      return [];
    }
  },

  /**
   * Get invite preview by token (public - token is the secret)
   */
  async getInviteByToken(token: string): Promise<InvitePreview | null> {
    try {
      const db = getDatabaseService();

      const { data: invite, error } = await db
        .from<CaseShareInvite>("case_share_invites")
        .select("case_id, email, expires_at")
        .eq("token", token)
        .maybeSingle();

      if (error || !invite) return null;
      if (new Date(invite.expires_at) < new Date()) {
        return {
          case_title: "",
          case_id: invite.case_id,
          email: invite.email,
          expires_at: invite.expires_at,
          valid: false,
        };
      }

      const { data: caseData } = await db
        .from("cases")
        .select("title")
        .eq("id", invite.case_id)
        .maybeSingle();

      return {
        case_title: caseData?.title ?? "a case",
        case_id: invite.case_id,
        email: invite.email,
        expires_at: invite.expires_at,
        valid: true,
      };
    } catch (error) {
      console.error("Unexpected error getting invite:", error);
      return null;
    }
  },

  /**
   * Redeem invite: create case_share and delete invite when user signs up
   */
  async redeemInvite(
    token: string,
    userId: string,
    userEmail: string,
  ): Promise<{ success: boolean; caseId?: string; error?: string }> {
    try {
      const db = getDatabaseService();

      const { data: invite, error: inviteError } = await db
        .from<CaseShareInvite>("case_share_invites")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (inviteError || !invite) {
        return { success: false, error: "Invalid or expired invite" };
      }

      if (new Date(invite.expires_at) < new Date()) {
        await db
          .from<CaseShareInvite>("case_share_invites")
          .delete()
          .eq("id", invite.id)
          .execute();
        return { success: false, error: "This invite has expired" };
      }

      const normalizedUserEmail = userEmail.toLowerCase().trim();
      const normalizedInviteEmail = invite.email.toLowerCase().trim();

      if (normalizedUserEmail !== normalizedInviteEmail) {
        return {
          success: false,
          error: "This invite was sent to a different email address",
        };
      }

      // Create case_share
      const { error: shareError } = await db
        .from("case_shares")
        .insert({
          case_id: invite.case_id,
          shared_with_user_id: userId,
          shared_by_user_id: invite.invited_by_user_id,
          can_view: invite.can_view,
          can_edit: invite.can_edit,
        })
        .execute();

      if (shareError) {
        // Might already exist if they redeemed before
        if (shareError.code === "23505") {
          await db
            .from<CaseShareInvite>("case_share_invites")
            .delete()
            .eq("id", invite.id)
            .execute();
          return { success: true, caseId: invite.case_id };
        }
        console.error("Error creating share from invite:", shareError);
        return { success: false, error: "Failed to grant access" };
      }

      // Delete invite
      await db
        .from<CaseShareInvite>("case_share_invites")
        .delete()
        .eq("id", invite.id)
        .execute();

      return { success: true, caseId: invite.case_id };
    } catch (error) {
      console.error("Unexpected error redeeming invite:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  },

  /**
   * Cancel a pending invite
   */
  async cancelInvite(caseId: string, inviteId: string): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) return false;

      const db = getDatabaseService();

      const { data: caseData, error: caseError } = await db
        .from("cases")
        .select("id")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (caseError || !caseData) return false;

      const { error } = await db
        .from<CaseShareInvite>("case_share_invites")
        .delete()
        .eq("id", inviteId)
        .eq("case_id", caseId)
        .execute();

      return !error;
    } catch (error) {
      console.error("Unexpected error cancelling invite:", error);
      return false;
    }
  },
};
