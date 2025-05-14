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
import { FileImage, File, Mail, Edit2, Check, X } from "lucide-react";
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

  const hasAttachments = 
    email.attachments && 
    Array.isArray(email.attachments) && 
    email.attachments.length > 0 &&
    email.attachments.every(att => 
      typeof att === 'object' && 
      att !== null && 
      'id' in att && 
      'url' in att && 
      'filename' in att
    );

  const handleSave = () => {
    onUpdate?.({
      ...email,
      date: editedDate,
      time: editedTime,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDate(email.date);
    setEditedTime(email.time);
    setIsEditing(false);
  };

  return (
    <>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-yellow-600" />
                <Badge variant="outline" className="text-xs">
                  Email
                </Badge>
                <h3 className="font-medium text-base truncate">
                  {email.subject || "No Subject"}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="truncate">{email.sender}</span>
                <span>→</span>
                <span className="truncate">{email.recipient}</span>
              </div>

              <div
                className={cn("transition-all duration-200 overflow-hidden", {
                  "max-h-16": !expanded,
                  "max-h-full": expanded,
                })}
              >
                <p className="text-sm whitespace-pre-line">
                  {email.content?.trim() || "(No content provided)"}
                </p>

                {hasAttachments && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(email.attachments as unknown as Attachment[] || []).map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 p-1.5 bg-muted rounded-md hover:bg-muted/80 cursor-pointer text-xs"
                        onClick={() => {
                          if (attachment.type?.startsWith("image/")) {
                            setViewImage(attachment.url);
                          } else {
                            window.open(attachment.url, "_blank");
                          }
                        }}
                      >
                        {attachment.type?.startsWith("image/") ? (
                          <FileImage className="h-3 w-3" />
                        ) : (
                          <File className="h-3 w-3" />
                        )}
                        <span className="truncate max-w-[150px]">
                          {attachment.filename}
                        </span>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-6 w-6 p-0"
                    >
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
