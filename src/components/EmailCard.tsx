import { useState } from "react";
import { Email } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileImage, File, Mail, Edit2, Check, X, Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface EmailCardProps {
  email: Email;
  onUpdate?: (updatedEmail: Email) => void;
}

interface Attachment {
  id: string;
  url: string;
  filename: string;
  type?: string;
}

const EmailCard = ({ email, onUpdate }: EmailCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState(email.date);
  const [editedTime, setEditedTime] = useState(email.time);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState(email.content);

  const hasAttachments = Array.isArray(email.attachments) && email.attachments.length > 0;

  const handleSave = () => {
    onUpdate?.({ ...email, date: editedDate, time: editedTime });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDate(email.date);
    setEditedTime(email.time);
    setIsEditing(false);
  };

  const applyHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement("span");
    span.className = `px-0.5 rounded-sm cursor-pointer ${color}`;
    span.textContent = range.toString();
    span.onclick = () => {
      span.replaceWith(document.createTextNode(span.textContent || ""));
      updateContent();
    };

    range.deleteContents();
    range.insertNode(span);
    updateContent();
  };

  const updateContent = () => {
    const html = document.getElementById("highlightable-content")?.innerHTML || "";
    setHighlightedContent(html);
  };

  const handleSaveHighlight = () => {
    onUpdate?.({ ...email, content: highlightedContent });
    setHighlightMode(false);
  };

  return (
    <>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-yellow-600" />
                <Badge variant="outline" className="text-xs">Email</Badge>
                <h3 className="font-medium text-base truncate">
                  {email.subject || "No Subject"}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="truncate">{email.sender}</span>
                <span>→</span>
                <span className="truncate">{email.recipient}</span>
              </div>

              <div className={cn("transition-all duration-200 overflow-hidden", {
                "max-h-16": !expanded,
                "max-h-full": expanded,
              })}>
                <div
                  id="highlightable-content"
                  className="text-sm whitespace-pre-line"
                  contentEditable={highlightMode}
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{
                    __html: highlightedContent?.trim() || "(No content provided)",
                  }}
                />

                {hasAttachments && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(email.attachments || []).map((att: Attachment) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 p-1.5 bg-muted rounded-md hover:bg-muted/80 cursor-pointer text-xs"
                        onClick={() =>
                          att.type?.startsWith("image/")
                            ? setViewImage(att.url)
                            : window.open(att.url, "_blank")
                        }
                      >
                        {att.type?.startsWith("image/") ? (
                          <FileImage className="h-3 w-3" />
                        ) : (
                          <File className="h-3 w-3" />
                        )}
                        <span className="truncate max-w-[150px]">{att.filename}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(email.content && email.content.length > 100) || hasAttachments ? (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="p-0 h-auto mt-2 text-legal-500 hover:text-legal-600"
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHighlightMode(!highlightMode)}
                  className="h-7 text-xs px-2"
                >
                  <Highlighter className="h-4 w-4 mr-1" />
                  {highlightMode ? "Exit Highlight" : "Highlight Text"}
                </Button>

                {highlightMode && (
                  <>
                    <Button size="sm" onClick={() => applyHighlight("bg-yellow-200")}>
                      Yellow
                    </Button>
                    <Button size="sm" onClick={() => applyHighlight("bg-green-200")}>
                      Green
                    </Button>
                    <Button size="sm" onClick={() => applyHighlight("bg-pink-200")}>
                      Pink
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSaveHighlight}>
                      <Check className="h-4 w-4 mr-1" />
                      Save Highlight
                    </Button>
                  </>
                )}
              </div>
            </div>

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
                    <p>{email.date}</p>
                  </div>
                  <p>{email.time}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Attachment Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={viewImage || ""}
              alt="Attachment Preview"
              className="max-h-[500px] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailCard;
