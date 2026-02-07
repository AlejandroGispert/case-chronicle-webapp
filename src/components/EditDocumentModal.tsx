import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { CaseDocument } from "@/backend/models/documentModel";

type DocumentWithDateTime = CaseDocument & { date: string; time: string };

interface EditDocumentModalProps {
  document: DocumentWithDateTime | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: DocumentWithDateTime) => void | Promise<void>;
}

const EditDocumentModal = ({
  document,
  open,
  onOpenChange,
  onSave,
}: EditDocumentModalProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (document) {
      setDate(document.date ?? "");
      setTime(document.time ?? "12:00");
    }
  }, [document, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    const trimmedDate = date.trim();
    if (!trimmedDate) {
      toast({
        title: "Date required",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updated: DocumentWithDateTime = {
        ...document,
        date: trimmedDate,
        time: time.trim() || "12:00",
      };
      await Promise.resolve(onSave(updated));
      toast({
        title: "Document updated",
        description: "Date and time have been saved.",
      });
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update document.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit document date</DialogTitle>
          <DialogDescription>
            Update the date and time shown for this document.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-docDate">Date</Label>
            <Input
              id="edit-docDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-docTime">Time</Label>
            <Input
              id="edit-docTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
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
  );
};

export default EditDocumentModal;
