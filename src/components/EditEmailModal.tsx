import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Email } from "@/types";

interface EditEmailModalProps {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEmail: Email) => void | Promise<void>;
}

const EditEmailModal = ({
  email,
  open,
  onOpenChange,
  onSave,
}: EditEmailModalProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (email) {
      setDate(email.date ?? "");
      setTime(email.time ?? "12:00");
      setSubject(email.subject ?? "");
      setSender(email.sender ?? "");
      setRecipient(email.recipient ?? "");
      setContent(email.content ?? "");
    }
  }, [email, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const trimmedDate = date.trim();
    if (!trimmedDate) {
      toast({
        title: "Date required",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }

    setConfirmSaveOpen(true);
  };

  const performSave = async () => {
    if (!email) return;

    const trimmedDate = date.trim();

    setSaving(true);
    setConfirmSaveOpen(false);
    try {
      const updated: Email = {
        ...email,
        date: trimmedDate,
        time: time.trim() || "12:00",
        subject: (subject.trim() || email.subject) ?? "",
        sender: (sender.trim() || email.sender) ?? "",
        recipient: (recipient.trim() || email.recipient) ?? "",
        content: content,
      };
      await Promise.resolve(onSave(updated));
      toast({
        title: "Email updated",
        description: "Your changes have been saved.",
      });
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update email.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!email) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit email</DialogTitle>
          <DialogDescription>
            Update the date, time, subject, participants, and body for this email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-emailDate">Date</Label>
              <Input
                id="edit-emailDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emailTime">Time</Label>
              <Input
                id="edit-emailTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-emailSubject">Subject</Label>
            <Input
              id="edit-emailSubject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-emailSender">From</Label>
              <Input
                id="edit-emailSender"
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Sender"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emailRecipient">To</Label>
              <Input
                id="edit-emailRecipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-emailContent">Body</Label>
            <Textarea
              id="edit-emailContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Email body"
              rows={8}
              className="resize-y min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to save these changes to this email?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={performSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};

export default EditEmailModal;
