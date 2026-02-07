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
import { Calendar } from "lucide-react";

interface NewEventModalProps {
  cases?: { id: string; title: string }[];
  caseId?: string; // Optional: if provided, pre-select this case and hide selector
  onAddEvent: (eventData: import("@/types").NewEventFormData, caseId: string) => void | Promise<void>;
  /** When set, control the dialog open state from outside (e.g. Add entry dropdown). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NewEventModal = ({
  cases = [],
  caseId,
  onAddEvent,
  open: openProp,
  onOpenChange,
}: NewEventModalProps) => {
  const [openInternal, setOpenInternal] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setOpenInternal;
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

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const eventDate = String(formData.get("eventDate") ?? "").trim();
    if (!eventDate) {
      toast({
        title: "Date required",
        description: "Please select a date for the event.",
        variant: "destructive",
      });
      return;
    }

    // Validate date is not more than 2 years in the future
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

    const eventData: import("@/types").NewEventFormData = {
      id: uuidv4(),
      title: String(formData.get("eventTitle") ?? ""),
      date: eventDate,
      time: String(formData.get("eventTime") ?? "12:00"),
      description: String(formData.get("eventDescription") ?? ""),
      event_type: "event",
    };

    if (!selectedCaseId) {
      toast({
        title: "No Case Selected",
        description: "Please select a case to assign the event to.",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.resolve(onAddEvent(eventData, selectedCaseId));
      toast({
        title: "Event added",
        description: "Your event has been added to the case.",
      });
      setOpen(false);
    } catch {
      toast({
        title: "Could not add event",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" className="flex-shrink-0">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New Entry</span>
          </Button>
        </DialogTrigger>
      )}
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
            <Input
              id="eventDate"
              name="eventDate"
              type="date"
              required
              max={(() => {
                const maxDate = new Date();
                maxDate.setFullYear(maxDate.getFullYear() + 2);
                return maxDate.toISOString().split("T")[0];
              })()}
            />
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
