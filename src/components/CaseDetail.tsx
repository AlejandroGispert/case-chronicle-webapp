import { useState, useEffect, useCallback } from "react";
import { Case, Email, Event } from "../types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EmailTimeline from "./EmailTimeline";
import NewEmailModal from "./NewEmailModal";
import { Calendar, Mail, Folder, Filter, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { format, isValid } from "date-fns";
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
import { eventController } from "@/backend/controllers/eventController";

interface CaseDetailProps {
  caseData: Case;
}

type TimelineItem = Email & { event_type: "Email" } | Event & { event_type: "Event" };
const CaseDetail = ({ caseData }: CaseDetailProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupBy, setGroupBy] = useState<string>("date");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchEmails = useCallback(async () => {
    try {
      const fetchedEmails = await emailController.fetchEmailsByCase(caseData.id);
      console.log("Fetched Emails:", fetchedEmails);
      if (fetchedEmails) {
        setEmails(fetchedEmails);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  }, [caseData.id]);

  useEffect(() => {
    console.log("CaseData:", caseData);
    fetchEmails();
    setEvents(caseData.events || []);
  }, [caseData, fetchEmails]);

  const handleAddEmail = async (newEmail: Email, caseId: string) => {
    if (caseId === caseData.id) {
      try {
        const createdEmail = await emailController.createNewEmail({
          id: newEmail.id,
          case_id: caseId,
          sender: newEmail.sender,
          recipient: newEmail.recipient,
          subject: newEmail.subject,
          content: newEmail.content,
          date: newEmail.date,
          time: newEmail.time,
          user_id: "",
          attachments: newEmail.attachments,
        });

        if (createdEmail) {
          await fetchEmails();
        }
      } catch (error) {
        console.error("Error adding email:", error);
      }
    }
  };

  const handleEmailUpdate = async (updatedEmail: Email) => {
    try {
      const result = await emailController.updateEmail({
        id: updatedEmail.id,
        date: updatedEmail.date,
        time: updatedEmail.time,
      });
      if (result) {
        await fetchEmails();
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const handleEventUpdate = async (updatedEvent: Event) => {
    try {
      const result = await eventController.updateEvent(updatedEvent);
      if (result) {
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      }
    } catch (error) {
      console.error("Error updating event:", error);
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

  const totalCommunications = (emails.length || 0) + (events.length || 0);

  const getCombinedTimeline = () => {
    const emailEvents = emails.map((email) => ({
      ...email,
      event_type: "Email" as const,
    }));

    const caseEvents = events.map((event) => ({
      ...event,
      event_type: event.event_type || "Event" as const,
    }));

    return [...emailEvents, ...caseEvents].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
      const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
      return sortDirection === "asc" 
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });
  };

  const isEmail = (item: any): item is Email => item.event_type === "Email";

  const filteredItems = getCombinedTimeline().filter((item) => {
    const matchesType = filterType === "all" || 
      (filterType === "email" && item.event_type === "Email") ||
      (filterType === "event" && item.event_type !== "Email");
    
    const matchesSearch = searchQuery === "" || 
      (isEmail(item)
        ? item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchQuery.toLowerCase())
        : item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const key = groupBy === "date" 
      ? item.date 
      : groupBy === "type" 
        ? item.event_type 
        : "all";
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <div>
            <h2 className="text-2xl font-serif font-semibold">
              {caseData.title}
            </h2>
            <p className="text-muted-foreground">{caseData.number}</p>
          </div>
          <Badge
            variant="outline"
            className={`${getStatusColor(
              caseData.status
            )} text-white px-3 py-1`}
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

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium font-serif">
              Communication Timeline
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
              <NewEmailModal
                cases={[{ id: caseData.id, title: caseData.title }]}
                onAddEmail={handleAddEmail}
              />
            </div>
          </div>

          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Group By</label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="none">No Grouping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search in communications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort Order</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
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
                {groupBy !== "none" && (
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {groupBy === "date" 
                        ? format(new Date(group), "MMMM d, yyyy")
                        : group}
                    </h4>
                    <Separator className="flex-1" />
                    <span className="text-sm text-muted-foreground">
                      {items.length} items
                    </span>
                  </div>
                )}
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="relative">
                      {item.event_type === "Email" ? (
                        <EmailCard 
                          email={item as Email} 
                          onUpdate={handleEmailUpdate} 
                        />
                      ) : (
                        <EventCard 
                          event={item} 
                          onUpdate={handleEventUpdate} 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
