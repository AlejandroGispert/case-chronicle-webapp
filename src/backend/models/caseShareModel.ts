import { getDatabaseService, getAuthService } from "../services";
import { Profile } from "./types";

// Type for case_shares table (assuming it exists in the database)
type CaseShare = {
  id: string;
  case_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  can_view: boolean;
  can_edit: boolean;
  created_at: string;
};

export type SharedUserWithPermissions = Profile & {
  share_id: string;
  can_view: boolean;
  can_edit: boolean;
};

export const caseShareModel = {
  /**
   * Share a case with a user by email
   */
  async shareCaseWithUser(
    caseId: string,
    userEmail: string,
    permissions?: { can_view?: boolean; can_edit?: boolean },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const authService = getAuthService();
      const { user: currentUser } = await authService.getUser();
      if (!currentUser) {
        return { success: false, error: "Not authenticated" };
      }

      const db = getDatabaseService();

      // Find user by email in profiles table
      const { data: profile, error: profileError } = await db
        .from<Profile>("profiles")
        .select("*")
        .eq("email", userEmail.toLowerCase().trim())
        .maybeSingle();

      if (profileError) {
        console.error("Error finding user by email:", profileError);
        return { success: false, error: "Error finding user" };
      }

      if (!profile) {
        return { success: false, error: "USER_NOT_FOUND" };
      }

      if (profile.id === currentUser.id) {
        return { success: false, error: "Cannot share case with yourself" };
      }

      // Check if case exists and belongs to current user
      const { data: caseData, error: caseError } = await db
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (caseError || !caseData) {
        return {
          success: false,
          error: "Case not found or you do not have permission",
        };
      }

      // Check if already shared
      const { data: existingShare, error: shareCheckError } = await db
        .from<CaseShare>("case_shares")
        .select("*")
        .eq("case_id", caseId)
        .eq("shared_with_user_id", profile.id)
        .maybeSingle();

      if (shareCheckError) {
        // Table might not exist, but we'll try to create the share anyway
        console.warn("Error checking existing share:", shareCheckError);
      }

      if (existingShare) {
        return { success: false, error: "Case already shared with this user" };
      }

      // Create share record
      const canView = permissions?.can_view ?? true;
      const canEdit = permissions?.can_edit ?? false;

      const { error: insertError } = await db
        .from<CaseShare>("case_shares")
        .insert({
          case_id: caseId,
          shared_with_user_id: profile.id,
          shared_by_user_id: currentUser.id,
          can_view: canView,
          can_edit: canEdit,
          created_at: new Date().toISOString(),
        })
        .execute();

      if (insertError) {
        console.error("Error creating share:", insertError);
        return { success: false, error: "Failed to share case" };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error sharing case:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  },

  /**
   * Get all users a case is shared with, including their permissions
   */
  async getSharedUsers(caseId: string): Promise<SharedUserWithPermissions[]> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) return [];

      const db = getDatabaseService();

      // Verify case belongs to current user
      const { data: caseData, error: caseError } = await db
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (caseError || !caseData) {
        return [];
      }

      // Get all shares for this case with permissions
      const { data: shares, error: sharesError } = await db
        .from<CaseShare>("case_shares")
        .select("id, shared_with_user_id, can_view, can_edit")
        .eq("case_id", caseId)
        .execute();

      if (sharesError || !shares || shares.length === 0) {
        return [];
      }

      // Get profiles for shared users
      const userIds = shares.map((s) => s.shared_with_user_id);
      const { data: profiles, error: profilesError } = await db
        .from<Profile>("profiles")
        .select("*")
        .in("id", userIds)
        .execute();

      if (profilesError) {
        console.error("Error fetching shared user profiles:", profilesError);
        return [];
      }

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
      return shares.map((s) => {
        const profile = profileMap.get(s.shared_with_user_id);
        if (!profile) return null;
        return {
          ...profile,
          share_id: s.id,
          can_view: s.can_view ?? true,
          can_edit: s.can_edit ?? false,
        };
      }).filter((u): u is SharedUserWithPermissions => u !== null);
    } catch (error) {
      console.error("Unexpected error getting shared users:", error);
      return [];
    }
  },

  /**
   * Remove share (unshare case with a user)
   */
  async unshareCase(
    caseId: string,
    sharedWithUserId: string,
  ): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) return false;

      const db = getDatabaseService();

      // Verify case belongs to current user
      const { data: caseData, error: caseError } = await db
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (caseError || !caseData) {
        return false;
      }

      // Remove share
      const { error } = await db
        .from<CaseShare>("case_shares")
        .delete()
        .eq("case_id", caseId)
        .eq("shared_with_user_id", sharedWithUserId)
        .execute();

      if (error) {
        console.error("Error removing share:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error unsharing case:", error);
      return false;
    }
  },

  /**
   * Update permissions for a shared user
   */
  async updatePermissions(
    caseId: string,
    sharedWithUserId: string,
    permissions: { can_view: boolean; can_edit: boolean },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const db = getDatabaseService();

      // Verify case belongs to current user
      const { data: caseData, error: caseError } = await db
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (caseError || !caseData) {
        return { success: false, error: "Case not found or you do not have permission" };
      }

      const { error } = await db
        .from<CaseShare>("case_shares")
        .update({
          can_view: permissions.can_view,
          can_edit: permissions.can_edit,
        })
        .eq("case_id", caseId)
        .eq("shared_with_user_id", sharedWithUserId)
        .execute();

      if (error) {
        console.error("Error updating permissions:", error);
        return { success: false, error: "Failed to update permissions" };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error updating permissions:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  },
};
