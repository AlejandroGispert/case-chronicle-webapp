import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Event } from "@/types";
import { CalendarDays, Clock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewEventModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
  categoryName?: string;
}

const formatTime = (timeString: string) => {
  if (!timeString) return "";
  try {
    if (timeString.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    }
    return timeString;
  } catch {
    return timeString;
  }
};

const ViewEventModal = ({
  event,
  open,
  onOpenChange,
  contactName,
  categoryName,
}: ViewEventModalProps) => {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const entryName =
    event.title?.trim() || event.event_type || "Untitled event";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif">View event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <div
              className={cn("p-1.5 rounded-full", {
                "bg-yellow-100": event.event_type === "Email",
                "bg-blue-100": event.event_type !== "Email",
              })}
            >
              {event.event_type === "Email" ? (
                <Mail className="h-4 w-4 text-yellow-600" />
              ) : (
                <CalendarDays className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {event.event_type || "Event"}
            </span>
            <h4 className="font-medium truncate flex-1">{entryName}</h4>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(event.date ?? "")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(event.time ?? "")}
            </span>
          </div>

          {event.description?.trim() && (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-sm whitespace-pre-line break-words">
                {event.description.trim()}
              </p>
            </div>
          )}

          {(contactName || categoryName) && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {contactName && <span>Contact: {contactName}</span>}
              {categoryName && <span>Category: {categoryName}</span>}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEventModal;
