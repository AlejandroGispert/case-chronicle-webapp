import { useState, useEffect, useCallback, useRef } from "react";
import { Case, Email, Event } from "../types";
import type { CreateEmailInput } from "@/backend/models/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EmailTimeline from "./EmailTimeline";
import NewEmailModal from "./NewEmailModal";
import NewEventModal from "./NewEventModal";
import AttachDocumentButton from "./AttachDocumentButton";
import {
  Calendar,
  Mail,
  Folder,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Plus,
  Upload,
} from "lucide-react";
import { format, isValid, parse } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EventTimeline from "./EventTimeline";
import { emailController } from "@/backend/controllers/emailController";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import EmailCard from "./EmailCard";
import EventCard from "./EventCard";
import DocumentCard from "./DocumentCard";
import { eventController } from "@/backend/controllers/eventController";
import { documentController } from "@/backend/controllers/documentController";
import { contactController } from "@/backend/controllers/contactController";
import { categoryController } from "@/backend/controllers/categoryController";
import { CaseDocument } from "@/backend/models/documentModel";
import { Contact, Category, Profile } from "@/backend/models/types";
import { Attachment } from "../types";
import NewCategoryModal from "./NewCategoryModal";
import { caseShareController } from "@/backend/controllers/caseShareController";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { CreateEventInput } from "@/backend/models/types";
import type { NewEventFormData } from "@/types";

interface CaseDetailProps {
  caseData: Case;
  /** When true, hide add/edit/delete actions (e.g. for shared view via ?readonly=true) */
  readonly?: boolean;
}

/** Email as shown in timeline (attachments enriched from Json). */
type TimelineEmail = Omit<Email, "attachments"> & {
  event_type: "Email";
  attachments?: Attachment[];
};
type TimelineEvent = Event & { event_type: "Event" };
type TimelineDocument = CaseDocument & {
  date: string;
  time: string;
  event_type: "Document";
};
type TimelineItem = TimelineEmail | TimelineEvent | TimelineDocument;

function isTimelineEmail(item: TimelineItem): item is TimelineEmail {
  return item.event_type === "Email";
}
function isTimelineEvent(item: TimelineItem): item is TimelineEvent {
  return item.event_type === "Event";
}
function isTimelineDocument(item: TimelineItem): item is TimelineDocument {
  return item.event_type === "Document";
}

const CaseDetail = ({ caseData, readonly = false }: CaseDetailProps) => {
  const [emails, setEmails] = useState<TimelineEmail[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [documents, setDocuments] = useState<
    (CaseDocument & { date: string; time: string })[]
  >([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [timelineDisplayCount, setTimelineDisplayCount] = useState(30);
  const [sharedUsers, setSharedUsers] = useState<
    import("@/backend/models/caseShareModel").SharedUserWithPermissions[]
  >([]);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [openEventModal, setOpenEventModal] = useState(false);
  const attachDocTriggerRef = useRef<(() => void) | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEmails = useCallback(async () => {
    try {
      const fetchedEmails = await emailController.fetchEmailsByCase(
        caseData.id,
      );
      if (fetchedEmails) {
        try {
          const enrichedEmails: TimelineEmail[] = fetchedEmails.map((email) => ({
            ...email,
            event_type: "Email" as const,
            attachments: (email.attachments as unknown as Attachment[]) ?? undefined,
          }));
          setEmails(enrichedEmails);
        } catch (err) {
          console.error("Error enriching emails:", err);
          setEmails([]);
        }
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  }, [caseData.id]);

  const fetchEvents = useCallback(async () => {
    try {
      const fetchedEvents = await eventController.fetchEventsByCase(
        caseData.id,
      );
      setEvents(fetchedEvents || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [caseData.id]);

  const fetchDocuments = useCallback(async () => {
    try {
      const fetchedDocuments = await documentController.fetchDocumentsByCase(
        caseData.id,
      );
      // Parse date and time from uploaded_at
      const documentsWithDateTime = fetchedDocuments.map((doc) => {
        try {
          const date = new Date(doc.uploaded_at);
          return {
            ...doc,
            date: format(date, "yyyy-MM-dd"),
            time: format(date, "HH:mm"),
          };
        } catch {
          const now = new Date();
          return {
            ...doc,
            date: format(now, "yyyy-MM-dd"),
            time: format(now, "HH:mm"),
          };
        }
      });
      setDocuments(documentsWithDateTime);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [caseData.id]);

  const fetchContacts = useCallback(async () => {
    try {
      const fetchedContacts = await contactController.fetchContactsByCase(
        caseData.id,
      );
      setContacts(fetchedContacts || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, [caseData.id]);

  const fetchCategories = useCallback(async () => {
    try {
      console.log("[CaseDetail] Starting to fetch categories...");
      const fetchedCategories = await categoryController.fetchAllCategories();
      console.log("[CaseDetail] Fetched categories result:", fetchedCategories);
      console.log(
        "[CaseDetail] Categories array length:",
        fetchedCategories?.length || 0,
      );
      if (fetchedCategories && fetchedCategories.length > 0) {
        console.log(
          "[CaseDetail] Category names:",
          fetchedCategories.map((c) => c.name),
        );
      }
      setCategories(fetchedCategories || []);
    } catch (error) {
      console.error("[CaseDetail] Error fetching categories:", error);
      if (error instanceof Error) {
        console.error("[CaseDetail] Error message:", error.message);
        console.error("[CaseDetail] Error stack:", error.stack);
      }
      setCategories([]);
    }
  }, []);

  const fetchSharedUsers = useCallback(async () => {
    try {
      const users = await caseShareController.getSharedUsers(caseData.id);
      setSharedUsers(users);
    } catch (error) {
      console.error("Error fetching shared users:", error);
    }
  }, [caseData.id]);

  useEffect(() => {
    console.log("CaseData:", caseData);
    fetchEmails();
    fetchEvents();
    fetchDocuments();
    fetchContacts();
    fetchCategories();
    fetchSharedUsers();
  }, [
    caseData,
    fetchEmails,
    fetchEvents,
    fetchDocuments,
    fetchContacts,
    fetchCategories,
    fetchSharedUsers,
  ]);

  useEffect(() => {
    console.log("Categories state updated:", categories);
  }, [categories]);

  const handleAddEmail = async (
    newEmail: CreateEmailInput,
    caseId: string,
  ) => {
    if (caseId === caseData.id) {
      try {
        const createdEmail = await emailController.createNewEmail(newEmail);

        if (createdEmail) {
          await fetchEmails();
        }
      } catch (error) {
        console.error("Error adding email:", error);
      }
    }
  };

  const handleAddEvent = async (eventData: NewEventFormData, caseId: string) => {
    if (caseId !== caseData.id || !user) return;
    const input: CreateEventInput = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: typeof eventData.time === "string" ? eventData.time : "12:00",
      case_id: caseId,
      user_id: user.id,
      event_type: eventData.event_type || "event",
    };
    const created = await eventController.createNewEvent(input);
    if (!created) {
      toast({
        title: "Error",
        description: "Could not add the event.",
        variant: "destructive",
      });
      throw new Error("Failed to create event");
    }
    await fetchEvents();
  };

  const handleEmailUpdate = async (updatedEmail: Email) => {
    try {
      const result = await emailController.updateEmail({
        id: updatedEmail.id,
        date: updatedEmail.date,
        time: updatedEmail.time,
        content: updatedEmail.content,
        subject: updatedEmail.subject,
        sender: updatedEmail.sender,
        recipient: updatedEmail.recipient,
      });
      if (result) {
        await fetchEmails();
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const handleEmailContactAssign = async (
    emailId: string,
    contactId: string | null,
  ) => {
    try {
      const success = await emailController.assignContactToEmail(
        emailId,
        contactId,
      );
      if (success) {
        await fetchEmails();
      }
    } catch (error) {
      console.error("Error assigning contact to email:", error);
    }
  };

  const handleEventUpdate = async (updatedEvent: Event) => {
    try {
      const result = await eventController.updateEvent(updatedEvent);
      if (result) {
        setEvents(
          events.map((e) => (e.id === updatedEvent.id ? result : e)),
        );
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleEventContactAssign = async (
    eventId: string,
    contactId: string | null,
  ) => {
    try {
      const success = await eventController.assignContactToEvent(
        eventId,
        contactId,
      );
      if (success) await fetchEvents();
    } catch (error) {
      console.error("Error assigning contact to event:", error);
    }
  };

  const handleEmailCategoryAssign = async (
    emailId: string,
    categoryId: string | null,
  ) => {
    try {
      const success = await emailController.assignCategoryToEmail(
        emailId,
        categoryId,
      );
      if (success) {
        await fetchEmails();
      }
    } catch (error) {
      console.error("Error assigning category to email:", error);
    }
  };

  const handleEventCategoryAssign = async (
    eventId: string,
    categoryId: string | null,
  ) => {
    try {
      const success = await eventController.assignCategoryToEvent(
        eventId,
        categoryId,
      );
      if (success) {
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error assigning category to event:", error);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const success = await eventController.removeEvent(eventId);
      if (success) await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEmailDelete = async (emailId: string) => {
    try {
      const success = await emailController.removeEmail(emailId);
      if (success) await fetchEmails();
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

  const handleDocumentUpdate = async (
    updatedDocument: CaseDocument & { date: string; time: string },
  ) => {
    try {
      setDocuments(
        documents.map((doc) =>
          doc.id === updatedDocument.id
            ? { ...doc, date: updatedDocument.date, time: updatedDocument.time }
            : doc,
        ),
      );
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const success = await documentController.removeDocument(documentId);
      if (success) await fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      if (dateString.includes("T")) {
        const date = new Date(dateString);
        if (isValid(date)) return format(date, "MMM d, yyyy");
      }
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const totalCommunications =
    (emails.length || 0) + (events.length || 0) + (documents.length || 0);

  const getCombinedTimeline = (): TimelineItem[] => {
    const emailEvents: TimelineEmail[] = emails.map((email) => ({
      ...email,
      event_type: "Email" as const,
    }));

    const caseEvents: TimelineEvent[] = events.map((event) => ({
      ...event,
      event_type: "Event" as const,
    }));

    const documentEvents: TimelineDocument[] = documents.map((doc) => ({
      ...doc,
      event_type: "Document" as const,
    }));

    return [...emailEvents, ...caseEvents, ...documentEvents].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
      const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
      return sortDirection === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });
  };

  const filteredItems = getCombinedTimeline().filter((item) => {
    const matchesType =
      filterType === "all" ||
      (filterType === "email" && item.event_type === "Email") ||
      (filterType === "event" &&
        item.event_type !== "Email" &&
        item.event_type !== "Document") ||
      (filterType === "document" && item.event_type === "Document");

    const matchesCategory =
      filterCategory === "all" ||
      (isTimelineEmail(item) && item.category_id === filterCategory) ||
      (isTimelineEvent(item) && item.category_id === filterCategory) ||
      (isTimelineDocument(item) && filterCategory === "all");

    const matchesSearch =
      searchQuery === "" ||
      (isTimelineDocument(item) &&
        item.filename.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (isTimelineEmail(item)
        ? (item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content?.toLowerCase().includes(searchQuery.toLowerCase())) ??
          false
        : isTimelineEvent(item)
          ? (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchQuery.toLowerCase())) ??
            false
          : false);

    return matchesType && matchesCategory && matchesSearch;
  });

  const displayItems = filteredItems.slice(0, timelineDisplayCount);
  const hasMore = displayItems.length < filteredItems.length;

  useEffect(() => {
    setTimelineDisplayCount(30);
  }, [filterType, filterCategory, searchQuery]);

  const groupedItems = displayItems.reduce(
    (acc, item) => {
      const key = item.date;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof filteredItems>,
  );

  return (
    <div className="bg-muted/25 rounded-lg border shadow-sm">
      <div className="p-6 rounded-lg bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold truncate">
              {caseData.title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {caseData.number}
            </p>
            <Link
              to="/select-case"
              className="text-sm text-primary hover:underline mt-1 inline-block"
            >
              Change case
            </Link>
          </div>
          <Badge
            variant="outline"
            className={`${getStatusColor(
              caseData.status,
            )} text-white px-3 py-1 shrink-0`}
          >
            {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <div className="flex items-center gap-3">
            <div className="bg-legal-50 p-2 rounded">
              <Folder className="h-6 w-6 text-legal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{caseData.client}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-legal-50 p-2 rounded">
              <Calendar className="h-6 w-6 text-legal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Created</p>
              <p className="font-medium">{formatDate(caseData.dateCreated)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-legal-50 p-2 rounded">
              <Mail className="h-6 w-6 text-legal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Communications</p>
              <p className="font-medium">{totalCommunications}</p>
            </div>
          </div>
        </div>

        {sharedUsers.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Share2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Shared with:
                </p>
                <div className="flex flex-wrap gap-2">
                  {sharedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {user.email}
                      {user.first_name || user.last_name
                        ? ` (${user.first_name} ${user.last_name})`
                        : ""}
                      {" · "}
                      {user.can_edit ? "Edit" : user.can_view ? "View" : "No access"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        <div className="bg-muted/20 rounded-lg p-4 sm:p-5 border border-border/50">
          <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-lg font-medium font-serif">
              Communication Timeline
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {!readonly && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="flex-shrink-0">
                        <Plus className="h-4 w-4 sm:mr-2" />
                        Add entry
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOpenEmailModal(true)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Add email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setOpenEventModal(true)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Add event
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => attachDocTriggerRef.current?.()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Attach document
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <NewEmailModal
                    cases={[{ id: caseData.id, title: caseData.title }]}
                    onAddEmail={handleAddEmail}
                    open={openEmailModal}
                    onOpenChange={setOpenEmailModal}
                  />
                  <NewEventModal
                    cases={[{ id: caseData.id, title: caseData.title }]}
                    caseId={caseData.id}
                    onAddEvent={handleAddEvent}
                    open={openEventModal}
                    onOpenChange={setOpenEventModal}
                  />
                  <AttachDocumentButton
                    cases={[
                      {
                        id: caseData.id,
                        title: caseData.title,
                        number: caseData.number || undefined,
                      },
                    ]}
                    defaultCaseId={caseData.id}
                    onDocumentAttached={() => {
                      fetchDocuments();
                      if (window.refreshDocumentsList) {
                        window.refreshDocumentsList();
                      }
                    }}
                    triggerRef={attachDocTriggerRef}
                    hideButton
                  />
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex-shrink-0"
              >
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4 sm:ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:ml-2" />
                )}
              </Button>
            </div>
          </div>

          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search in communications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="email">Emails</SelectItem>
                      <SelectItem value="event">Events</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Filter by Category
                    </label>
                    {!readonly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="h-6 text-xs"
                      >
                        + New
                      </Button>
                    )}
                  </div>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort Order</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }
                    className="w-full"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {sortDirection === "asc" ? "Oldest First" : "Newest First"}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-6">
            {Object.entries(groupedItems).map(([group, items]) => (
              <div key={group} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground min-w-0 break-words">
                    {format(
                      parse(group, "yyyy-MM-dd", new Date()),
                      "MMMM d, yyyy",
                    )}
                  </h4>
                    <Separator className="flex-1 hidden sm:block" />
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    {items.length} items
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="relative">
                      {item.event_type === "Email" ? (
                        <EmailCard
                          email={item as unknown as Email}
                          onUpdate={
                            readonly
                              ? undefined
                              : (e) => handleEmailUpdate(e as Email)
                          }
                          onDelete={readonly ? undefined : handleEmailDelete}
                          contacts={contacts}
                          onContactAssign={readonly ? undefined : handleEmailContactAssign}
                          categories={categories}
                          onCategoryAssign={readonly ? undefined : handleEmailCategoryAssign}
                        />
                      ) : item.event_type === "Event" ? (
                        <EventCard
                          event={item as Event}
                          onUpdate={readonly ? undefined : handleEventUpdate}
                          onDelete={readonly ? undefined : handleEventDelete}
                          contacts={contacts}
                          onContactAssign={readonly ? undefined : handleEventContactAssign}
                          categories={categories}
                          onCategoryAssign={readonly ? undefined : handleEventCategoryAssign}
                        />
                      ) : (
                        <DocumentCard
                          document={
                            item as CaseDocument & {
                              date: string;
                              time: string;
                            }
                          }
                          onUpdate={readonly ? undefined : handleDocumentUpdate}
                          onDelete={readonly ? undefined : handleDocumentDelete}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTimelineDisplayCount((prev) => Math.min(prev + 30, filteredItems.length))
                }
              >
                Load more
              </Button>
            </div>
          )}
          </div>
        </div>
        </div>
      </div>
      <NewCategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onCategoryAdded={fetchCategories}
      />
    </div>
  );
};

export default CaseDetail;
