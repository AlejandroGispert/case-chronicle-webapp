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
import { Share2, X } from "lucide-react";
import { caseShareController } from "@/backend/controllers/caseShareController";
import { Profile } from "@/backend/models/types";
import { Badge } from "@/components/ui/badge";

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
  const [sharedUsers, setSharedUsers] = useState<Profile[]>([]);
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
      const users = await caseShareController.getSharedUsers(caseId);
      setSharedUsers(users);
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
        toast({
          title: "Case Shared",
          description: `Case has been shared with ${email}`,
        });
        setEmail("");
        await fetchSharedUsers();
        if (onShareSuccess) {
          onShareSuccess();
        }
      } else {
        toast({
          title: "Share Failed",
          description: result.error || "Failed to share case",
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
          ) : sharedUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No users have access to this case yet.
            </div>
          ) : (
            <div className="space-y-2">
              {sharedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{user.email}</Badge>
                    {user.first_name || user.last_name ? (
                      <span className="text-sm text-muted-foreground">
                        ({user.first_name} {user.last_name})
                      </span>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnshare(user.id, user.email)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
