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
import type { Event } from "@/types";

interface EditEventModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: Event) => void | Promise<void>;
}

const EditEventModal = ({
  event,
  open,
  onOpenChange,
  onSave,
}: EditEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setTitle(event.title ?? "");
      setDescription(event.description ?? "");
      setDate(event.date ?? "");
      setTime(event.time ?? "12:00");
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast({
        title: "Title required",
        description: "Please enter an event title.",
        variant: "destructive",
      });
      return;
    }

    const eventDate = date.trim();
    if (!eventDate) {
      toast({
        title: "Date required",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(eventDate);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    if (selectedDate > maxDate) {
      toast({
        title: "Invalid Date",
        description: "Date cannot be more than 2 years in the future.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updated: Event = {
        ...event,
        title: trimmedTitle,
        description: description.trim(),
        date: eventDate,
        time: time.trim() || "12:00",
      };
      await Promise.resolve(onSave(updated));
      toast({
        title: "Event updated",
        description: "Your changes have been saved.",
      });
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update event.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const maxDateStr = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split("T")[0];
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the event title, description, date, and time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-eventTitle">Title</Label>
            <Input
              id="edit-eventTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-eventDate">Date</Label>
            <Input
              id="edit-eventDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max={maxDateStr}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-eventTime">Time</Label>
            <Input
              id="edit-eventTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-eventDescription">Description (optional)</Label>
            <textarea
              id="edit-eventDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 rounded-md border px-3 py-2 text-sm"
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

export default EditEventModal;
