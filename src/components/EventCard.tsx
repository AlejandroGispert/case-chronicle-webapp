import { useState, useEffect } from "react";
import { Event } from "@/types";
import {
  CalendarDays,
  Clock,
  Mail,
  Edit2,
  User,
  Tag,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Contact, Category } from "@/backend/models/types";
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
import EditEventModal from "@/components/EditEventModal";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: Event;
  onUpdate?: (updatedEvent: Event) => void;
  onDelete?: (eventId: string) => void;
  contacts?: Contact[];
  onContactAssign?: (eventId: string, contactId: string | null) => void;
  categories?: Category[];
  onCategoryAssign?: (eventId: string, categoryId: string | null) => void;
}

const EventCard = ({
  event,
  onUpdate,
  onDelete,
  contacts = [],
  onContactAssign,
  categories = [],
  onCategoryAssign,
}: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [contactPopoverOpen, setContactPopoverOpen] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const assignedContact = contacts.find((c) => c.id === event.contact_id);
  const assignedCategory = categories.find((c) => c.id === event.category_id);

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  const handleEditSave = (updatedEvent: Event) => {
    setCurrentEvent(updatedEvent);
    onUpdate?.(updatedEvent);
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
    if (!dateString) return "";
    try {
      if (dateString.includes("T")) {
        const date = new Date(dateString);
        return format(date, "MMM d, yyyy");
      }
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
        if (isValid(parsedDate)) {
          return format(parsedDate, "MMM d, yyyy");
        }
      }
      if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const parsedDate = parse(dateString, "MM/dd/yyyy", new Date());
        if (isValid(parsedDate)) {
          return format(parsedDate, "MMM d, yyyy");
        }
      }
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const entryName = currentEvent.title || "No Title";

  return (
    <>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn("p-1.5 rounded-full", {
                    "bg-yellow-100": currentEvent.event_type === "Email",
                    "bg-blue-100": currentEvent.event_type !== "Email",
                  })}
                >
                  {currentEvent.event_type === "Email" ? (
                    <Mail className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentEvent.event_type || "Event"}
                </Badge>
                <h3 className="font-medium text-base truncate">{entryName}</h3>
              </div>

              <div className="text-sm">
                <p className="whitespace-pre-line break-words">
                  {currentEvent.description?.trim()
                    ? isExpanded
                      ? currentEvent.description.trim()
                      : currentEvent.description.trim().length > 100
                        ? `${currentEvent.description.trim().slice(0, 100)}…`
                        : currentEvent.description.trim()
                    : "(No description provided)"}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Popover
                    open={contactPopoverOpen}
                    onOpenChange={setContactPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Assign contact"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <Select
                        value={currentEvent.contact_id || "none"}
                        onValueChange={(value) => {
                          if (onContactAssign) {
                            onContactAssign(
                              currentEvent.id,
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
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Assign category"
                      >
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <Select
                        value={currentEvent.category_id || "none"}
                        onValueChange={(value) => {
                          if (onCategoryAssign) {
                            onCategoryAssign(
                              currentEvent.id,
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

              {currentEvent.description &&
                currentEvent.description.trim().length > 100 && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-0 h-auto mt-2 text-legal-500 hover:text-legal-600"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </Button>
                )}
            </div>

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
                      title="Edit event"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete entry"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="break-words sm:break-normal">
                    {formatDate(currentEvent.date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="break-words sm:break-normal">
                    {formatTime(currentEvent.time)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {onUpdate && (
        <EditEventModal
          key={currentEvent.id}
          event={currentEvent}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={handleEditSave}
        />
      )}

      {onDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete entry</AlertDialogTitle>
              <AlertDialogDescription>
                Delete entry &quot;{entryName}&quot;? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  onDelete(currentEvent.id);
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

export default EventCard;
