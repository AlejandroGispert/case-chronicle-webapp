import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FileText, CalendarDays, Clock, ExternalLink } from "lucide-react";
import type { CaseDocument } from "@/backend/models/documentModel";

type DocumentWithDateTime = CaseDocument & { date: string; time: string };

interface ViewDocumentModalProps {
  document: DocumentWithDateTime | null;
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

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ViewDocumentModal = ({
  document,
  open,
  onOpenChange,
}: ViewDocumentModalProps) => {
  if (!document) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            View document
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <h4 className="font-medium text-base break-all">
              {document.filename}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(document.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(document.time)}
            </span>
            {document.size && (
              <span>{formatFileSize(document.size)}</span>
            )}
          </div>
          {document.url && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
            </Button>
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

export default ViewDocumentModal;
