import { useState } from "react";
import { CaseDocument } from "@/backend/models/documentModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Edit2, Check, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface DocumentCardProps {
  document: CaseDocument;
  onUpdate?: (updatedDocument: CaseDocument & { date: string; time: string }) => void;
}

const DocumentCard = ({ document, onUpdate }: DocumentCardProps) => {
  // Parse date and time from uploaded_at
  const parseDateTime = (uploadedAt: string) => {
    try {
      const date = new Date(uploadedAt);
      return {
        date: format(date, "yyyy-MM-dd"),
        time: format(date, "HH:mm"),
      };
    } catch {
      const now = new Date();
      return {
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm"),
      };
    }
  };

  const initialDateTime = parseDateTime(document.uploaded_at);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState(initialDateTime.date);
  const [editedTime, setEditedTime] = useState(initialDateTime.time);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...document,
        date: editedDate,
        time: editedTime,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDate(initialDateTime.date);
    setEditedTime(initialDateTime.time);
    setIsEditing(false);
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
                  {formatDate(editedDate)}
                </span>
                <span>{formatTime(editedTime)}</span>
                {document.size && (
                  <span>{formatFileSize(document.size)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <Input
                    type="time"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={handleSave} className="h-6 w-6 p-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel} className="h-6 w-6 p-0">
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-6 w-6 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <p>{formatDate(editedDate)}</p>
                  </div>
                  <p>{formatTime(editedTime)}</p>
                </>
              )}
            </div>
            {document.url && (
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
