import { getDatabaseService, getAuthService } from "../services";
import { Profile } from "./types";

// Type for case_shares table (assuming it exists in the database)
type CaseShare = {
  id: string;
  case_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  created_at: string;
};

export const caseShareModel = {
  /**
   * Share a case with a user by email
   */
  async shareCaseWithUser(
    caseId: string,
    userEmail: string,
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
        return { success: false, error: "User not found with this email" };
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
      const { error: insertError } = await db
        .from<CaseShare>("case_shares")
        .insert({
          case_id: caseId,
          shared_with_user_id: profile.id,
          shared_by_user_id: currentUser.id,
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
   * Get all users a case is shared with
   */
  async getSharedUsers(caseId: string): Promise<Profile[]> {
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

      // Get all shares for this case
      const { data: shares, error: sharesError } = await db
        .from<CaseShare>("case_shares")
        .select("shared_with_user_id")
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

      return profiles || [];
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
};
