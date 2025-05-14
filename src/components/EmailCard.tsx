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
import { FileImage, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EmailCardProps {
  email: Email;
}

const EmailCard = ({ email }: EmailCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const hasAttachments =
    email.attachments &&
    Array.isArray(email.attachments) &&
    email.attachments.length > 0;

  return (
    <>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
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
                    {email.attachments.map((attachment) => (
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
              <p>{email.date}</p>
              <p>{email.time}</p>
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
