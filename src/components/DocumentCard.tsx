import { useState } from "react";
import { CaseDocument } from "@/backend/models/documentModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { FileText, Download, Edit2, Calendar, CalendarDays, Clock, ExternalLink } from "lucide-react";
import EditDocumentModal from "@/components/EditDocumentModal";
import { format } from "date-fns";

type DocumentWithDateTime = CaseDocument & { date: string; time: string };

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;

function isImageDocument(doc: CaseDocument): boolean {
  if (doc.type?.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.test(doc.filename ?? "");
}

interface DocumentCardProps {
  document: DocumentWithDateTime;
  onUpdate?: (updatedDocument: DocumentWithDateTime) => void;
}

const DocumentCard = ({ document, onUpdate }: DocumentCardProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const handleEditSave = (updated: DocumentWithDateTime) => {
    onUpdate?.(updated);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!document.url) return;
    if (isImageDocument(document)) {
      setImagePreviewOpen(true);
    } else {
      window.open(document.url, "_blank", "noopener,noreferrer");
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return format(date, "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <>
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{document.filename}</h4>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.date)}
                </span>
                <span>{formatTime(document.time)}</span>
                {document.size && (
                  <span>{formatFileSize(document.size)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-left sm:text-right text-xs text-muted-foreground w-full sm:w-auto sm:whitespace-nowrap">
              <div className="flex flex-col items-start sm:items-end gap-1">
                <div className="flex items-center gap-1 justify-start sm:justify-end">
                  {onUpdate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditModalOpen(true);
                      }}
                      className="h-6 w-6 p-0"
                      title="Edit document"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="break-words sm:break-normal">
                    {formatDate(document.date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="break-words sm:break-normal">
                    {formatTime(document.time)}
                  </span>
                </div>
              </div>
            </div>
            {document.url && (
              <>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleOpen}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {onUpdate && (
      <EditDocumentModal
        key={document.id}
        document={document}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleEditSave}
      />
    )}

    <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto p-2 overflow-auto">
        <div className="flex items-center justify-center min-h-[200px] bg-muted/30 rounded-lg p-4">
          <img
            src={document.url}
            alt={document.filename}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded"
          />
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
};

export default DocumentCard;
