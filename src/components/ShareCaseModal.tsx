import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Share2, X, Eye, Pencil, Copy, Clock } from "lucide-react";
import { caseShareController } from "@/backend/controllers/caseShareController";
import { caseShareInviteController } from "@/backend/controllers/caseShareInviteController";
import type { SharedUserWithPermissions } from "@/backend/models/caseShareModel";
import type { PendingInvite } from "@/backend/models/caseShareInviteModel";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareCaseModalProps {
  caseId: string;
  caseTitle?: string;
  onShareSuccess?: () => void;
}

const ShareCaseModal = ({
  caseId,
  caseTitle,
  onShareSuccess,
}: ShareCaseModalProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUserWithPermissions[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isLoadingSharedUsers, setIsLoadingSharedUsers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSharedUsers();
    }
  }, [open, caseId]);

  const fetchSharedUsers = async () => {
    setIsLoadingSharedUsers(true);
    try {
      const [users, invites] = await Promise.all([
        caseShareController.getSharedUsers(caseId),
        caseShareInviteController.getPendingInvites(caseId),
      ]);
      setSharedUsers(users);
      setPendingInvites(invites);
    } catch (error) {
      console.error("Error fetching shared users:", error);
    } finally {
      setIsLoadingSharedUsers(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await caseShareController.shareCaseWithUser(
        caseId,
        email.trim(),
      );

      if (result.success) {
        const pendingResult = result as { success: boolean; inviteLink?: string; pending?: boolean };
        if (pendingResult.pending && pendingResult.inviteLink) {
          toast({
            title: "Invite Sent",
            description: `${email} doesn't have an account yet. Copy the invite link below and send it to them.`,
          });
          await navigator.clipboard.writeText(pendingResult.inviteLink);
          toast({
            title: "Link Copied",
            description: "Invite link copied to clipboard. Share it with the recipient.",
          });
        } else {
          toast({
            title: "Case Shared",
            description: `Case has been shared with ${email}`,
          });
        }
        setEmail("");
        await fetchSharedUsers();
        if (onShareSuccess) {
          onShareSuccess();
        }
      } else {
        const errResult = result as { success: boolean; error?: string };
        toast({
          title: "Share Failed",
          description: errResult.error || "Failed to share case",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sharing case:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermissions = async (
    userId: string,
    canView: boolean,
    canEdit: boolean,
  ) => {
    try {
      const result = await caseShareController.updatePermissions(caseId, userId, {
        can_view: canView,
        can_edit: canEdit,
      });
      if (result?.success) {
        toast({
          title: "Permissions Updated",
          description: "Access permissions have been updated.",
        });
        await fetchSharedUsers();
        onShareSuccess?.();
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to update permissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard.",
    });
  };

  const handleCancelInvite = async (inviteId: string, inviteEmail: string) => {
    try {
      const success = await caseShareInviteController.cancelInvite(caseId, inviteId);
      if (success) {
        toast({
          title: "Invite Cancelled",
          description: `Invite for ${inviteEmail} has been cancelled.`,
        });
        await fetchSharedUsers();
        onShareSuccess?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel invite",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling invite:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUnshare = async (userId: string, userEmail: string) => {
    try {
      const success = await caseShareController.unshareCase(caseId, userId);
      if (success) {
        toast({
          title: "Access Removed",
          description: `Case access removed for ${userEmail}`,
        });
        await fetchSharedUsers();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove access",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error unsharing case:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-shrink-0">
          <Share2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Share Case</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share Case</DialogTitle>
          <DialogDescription>
            {caseTitle
              ? `Share "${caseTitle}" with other users`
              : "Share this case with other users by entering their email address."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="shareEmail">User Email</Label>
            <div className="flex gap-2">
              <Input
                id="shareEmail"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-2 pt-4 border-t">
          <Label>Shared With</Label>
          {isLoadingSharedUsers ? (
            <div className="text-sm text-muted-foreground py-2">Loading...</div>
          ) : sharedUsers.length === 0 && pendingInvites.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No users have access to this case yet.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-md border-amber-200 bg-amber-50/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                    <Badge variant="outline" className="truncate border-amber-300">
                      {invite.email}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Pending · {invite.can_edit ? "Edit" : "View"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyInviteLink(invite.token)}
                      className="h-8"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id, invite.email)}
                      className="h-8 w-8 p-0"
                      title="Cancel invite"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {sharedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-md"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="secondary" className="truncate">
                      {user.email}
                    </Badge>
                    {user.first_name || user.last_name ? (
                      <span className="text-sm text-muted-foreground truncate">
                        ({user.first_name} {user.last_name})
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select
                      value={user.can_edit ? "edit" : user.can_view ? "view" : "none"}
                      onValueChange={(v) =>
                        handleUpdatePermissions(
                          user.id,
                          v !== "none",
                          v === "edit",
                        )
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <span className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5" /> View
                          </span>
                        </SelectItem>
                        <SelectItem value="edit">
                          <span className="flex items-center gap-2">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </span>
                        </SelectItem>
                        <SelectItem value="none">No access</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnshare(user.id, user.email)}
                      className="h-8 w-8 p-0"
                      title="Remove access"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCaseModal;
