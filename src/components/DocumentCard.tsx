import { useState } from "react";
import { CaseDocument } from "@/backend/models/documentModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { FileText, Download, Edit2, Eye, CalendarDays, Clock, Trash2 } from "lucide-react";
import EditDocumentModal from "@/components/EditDocumentModal";
import ViewDocumentModal from "@/components/ViewDocumentModal";
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
  onDelete?: (documentId: string) => void;
}

const DocumentCard = ({ document, onUpdate, onDelete }: DocumentCardProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const handleEditSave = (updated: DocumentWithDateTime) => {
    onUpdate?.(updated);
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isImageDocument(document)) {
      setImagePreviewOpen(true);
    } else {
      setViewModalOpen(true);
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex-shrink-0 mt-1">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(document.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(document.time)}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleView}
                    className="h-7 w-7 p-0"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
                      className="h-7 w-7 p-0"
                      title="Edit document"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete document"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{document.filename}</h4>
              </div>
              {document.size && (
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(document.size)}
                </div>
              )}
              {document.url && (
                <div className="flex items-center gap-2 mt-2">
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
                </div>
              )}
            </div>
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

    <ViewDocumentModal
      document={document}
      open={viewModalOpen}
      onOpenChange={setViewModalOpen}
    />

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

    {onDelete && (
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{document.filename}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(document.id);
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}
  </>
  );
};

export default DocumentCard;
