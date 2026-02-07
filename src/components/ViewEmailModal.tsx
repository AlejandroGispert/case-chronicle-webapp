import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Email } from "@/types";
import { CalendarDays, Clock, Mail } from "lucide-react";

interface ViewEmailModalProps {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const ViewEmailModal = ({
  email,
  open,
  onOpenChange,
}: ViewEmailModalProps) => {
  if (!email) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const hasAttachments =
    Array.isArray(email.attachments) && email.attachments.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Mail className="h-5 w-5 text-yellow-600" />
            View email
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2 overflow-y-auto flex-1 min-h-0">
          <div>
            <h4 className="font-medium text-base">
              {email.subject || "No Subject"}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(email.date ?? "")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(email.time ?? "")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">From: </span>
              <span className="break-all">{email.sender || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">To: </span>
              <span className="break-all">{email.recipient || "—"}</span>
            </div>
          </div>

          {email.content && (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-sm whitespace-pre-wrap break-words">
                {email.content}
              </p>
            </div>
          )}

          {hasAttachments && (
            <div className="text-sm">
              <span className="text-muted-foreground font-medium">
                Attachments ({email.attachments!.length}):
              </span>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                {email.attachments!.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {att.filename}
                    </a>
                  </li>
                ))}
              </ul>
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

export default ViewEmailModal;
