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
import {
  FileImage,
  File,
  Mail,
  Edit2,
  Check,
  X,
  Highlighter,
  User,
  Tag,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Contact, Category } from "@/backend/models/types";

interface EmailCardProps {
  email: Email;
  onUpdate?: (updatedEmail: Email) => void;
  onDelete?: (emailId: string) => void;
  contacts?: Contact[];
  onContactAssign?: (emailId: string, contactId: string | null) => void;
  categories?: Category[];
  onCategoryAssign?: (emailId: string, categoryId: string | null) => void;
}

interface Attachment {
  id: string;
  url: string;
  filename: string;
  type?: string;
}

const EmailCard = ({
  email,
  onUpdate,
  onDelete,
  contacts = [],
  onContactAssign,
  categories = [],
  onCategoryAssign,
}: EmailCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState(email.date);
  const [editedTime, setEditedTime] = useState(email.time);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState(email.content);
  const [contactPopoverOpen, setContactPopoverOpen] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const assignedContact = contacts.find((c) => c.id === email.contact_id);
  const assignedCategory = categories.find((c) => c.id === email.category_id);

  const hasAttachments =
    Array.isArray(email.attachments) && email.attachments.length > 0;

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
    const html =
      document.getElementById("highlightable-content")?.innerHTML || "";
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
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
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

              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHighlightMode(!highlightMode)}
                      className="h-7 w-7 p-0"
                    >
                      <Highlighter className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Highlight text</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-2">
                  <Popover
                    open={contactPopoverOpen}
                    onOpenChange={setContactPopoverOpen}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assign contact</p>
                      </TooltipContent>
                    </Tooltip>
                    <PopoverContent className="w-64 p-2" align="start">
                      <Select
                        value={email.contact_id || "none"}
                        onValueChange={(value) => {
                          if (onContactAssign) {
                            onContactAssign(
                              email.id,
                              value === "none" ? null : value,
                            );
                            setContactPopoverOpen(false);
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Assign contact" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            No contact assigned
                          </SelectItem>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </PopoverContent>
                  </Popover>
                  {assignedContact && (
                    <Badge variant="outline" className="text-xs">
                      {assignedContact.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Popover
                    open={categoryPopoverOpen}
                    onOpenChange={setCategoryPopoverOpen}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assign category</p>
                      </TooltipContent>
                    </Tooltip>
                    <PopoverContent className="w-64 p-2" align="start">
                      <Select
                        value={email.category_id || "none"}
                        onValueChange={(value) => {
                          if (onCategoryAssign) {
                            onCategoryAssign(
                              email.id,
                              value === "none" ? null : value,
                            );
                            setCategoryPopoverOpen(false);
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Assign category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </PopoverContent>
                  </Popover>
                  {assignedCategory && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={
                        assignedCategory.color
                          ? {
                              borderColor: assignedCategory.color,
                              color: assignedCategory.color,
                            }
                          : {}
                      }
                    >
                      {assignedCategory.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div
                className={cn("transition-all duration-200 overflow-hidden", {
                  "max-h-16": !expanded,
                  "max-h-full": expanded,
                })}
              >
                <div
                  id="highlightable-content"
                  className="text-sm whitespace-pre-line"
                  contentEditable={highlightMode}
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{
                    __html:
                      highlightedContent?.trim() || "(No content provided)",
                  }}
                />

                {hasAttachments && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Array.isArray(email.attachments)
                      ? (email.attachments as unknown as Attachment[])
                      : []
                    ).map((att: Attachment) => (
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
                        <span className="truncate max-w-[150px]">
                          {att.filename}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(email.content && email.content.length > 100) ||
              hasAttachments ? (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="p-0 h-auto mt-2 text-legal-500 hover:text-legal-600"
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              ) : null}

              {highlightMode && (
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <Button
                    size="sm"
                    onClick={() => applyHighlight("bg-yellow-200")}
                  >
                    Yellow
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => applyHighlight("bg-green-200")}
                  >
                    Green
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => applyHighlight("bg-pink-200")}
                  >
                    Pink
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveHighlight}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save Highlight
                  </Button>
                </div>
              )}
            </div>

            <div className="text-left sm:text-right text-xs text-muted-foreground w-full sm:w-auto sm:whitespace-nowrap">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    className="h-7 text-xs w-full sm:w-auto"
                  />
                  <Input
                    type="time"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    className="h-7 text-xs w-full sm:w-auto"
                  />
                  <div className="flex gap-1 justify-start sm:justify-end">
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
                  <div className="flex items-center gap-1 justify-start sm:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete email"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <p className="break-words sm:break-normal">{email.date}</p>
                  </div>
                  <p className="break-words sm:break-normal">{email.time}</p>
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

      {onDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete email</AlertDialogTitle>
              <AlertDialogDescription>
                Delete email &quot;{email.subject || "No Subject"}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  onDelete(email.id);
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

export default EmailCard;
