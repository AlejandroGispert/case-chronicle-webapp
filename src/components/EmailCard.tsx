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
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-base truncate max-w-[250px]">
                {email.subject || "No Subject"}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {email.sender || "Unknown Sender"} →{" "}
                {email.recipient || "Unknown Recipient"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">
                {email.date}
              </p>
              <p className="text-xs text-muted-foreground">{email.time}</p>
            </div>
          </div>

          <div
            className={cn(
              "transition-all duration-200 overflow-hidden",
              {
                "max-h-16": !expanded,
                "max-h-full": expanded,
              }
            )}
          >
            <p className="text-sm whitespace-pre-line">
              {email.content?.toString().trim() || "(No content provided)"}
            </p>

            {hasAttachments && (
              <div className="mt-3 flex flex-wrap gap-2">
                {email.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-muted rounded-md hover:bg-muted/80 cursor-pointer"
                    onClick={() => {
                      if (
                        attachment.type &&
                        attachment.type.startsWith("image/")
                      ) {
                        setViewImage(attachment.url);
                      } else {
                        window.open(attachment.url, "_blank");
                      }
                    }}
                  >
                    {attachment.type &&
                    attachment.type.startsWith("image/") ? (
                      <FileImage className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                    <span className="text-xs">{attachment.filename}</span>
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
