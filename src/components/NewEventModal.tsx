import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface NewEventModalProps {
  cases?: { id: string; title: string }[];
  caseId?: string; // Optional: if provided, pre-select this case and hide selector
  onAddEvent: (eventData: any, caseId: string) => void;
}

const NewEventModal = ({
  cases = [],
  caseId,
  onAddEvent,
}: NewEventModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    caseId || null,
  );
  const { toast } = useToast();

  // Update selectedCaseId when caseId prop changes
  useEffect(() => {
    if (caseId) {
      setSelectedCaseId(caseId);
    }
  }, [caseId]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const eventData = {
      id: uuidv4(),
      title: formData.get("eventTitle"),
      date: formData.get("eventDate"),
      time: formData.get("eventTime"),
      description: formData.get("eventDescription"),
      event_type: "event",
    };

    if (selectedCaseId) {
      onAddEvent(eventData, selectedCaseId);
      toast({
        title: "Event Added",
        description: "Your event has been added to the case.",
      });
      setOpen(false);
    } else {
      toast({
        title: "No Case Selected",
        description: "Please select a case to assign the event to.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Register New Case Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Entry to Case</DialogTitle>
          <DialogDescription>
            Create a new entry and assign it to a case.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddEvent} className="space-y-4 pt-4">
          {!caseId && (
            <div className="space-y-2">
              <Label htmlFor="caseSelect">Select Case</Label>
              <Select
                onValueChange={setSelectedCaseId}
                value={selectedCaseId || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a case" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(cases) && cases.length > 0 ? (
                    cases.map((caseItem) => (
                      <SelectItem key={caseItem.id} value={caseItem.id}>
                        {caseItem.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm px-2 py-1">
                      No cases available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title</Label>
            <Input id="eventTitle" name="eventTitle" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Date</Label>
            <Input id="eventDate" name="eventDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime">Time</Label>
            <Input id="eventTime" name="eventTime" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Description</Label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              className="w-full h-32 rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewEventModal;
