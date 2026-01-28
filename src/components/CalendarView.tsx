import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { emailController } from "@/backend/controllers/emailController";
import { eventController } from "@/backend/controllers/eventController";
import { useToast } from "@/hooks/use-toast";
import { Email, Event } from "@/types";
import { format, parse, isValid, compareAsc } from "date-fns";
import { Calendar as CalendarIcon, Mail, CalendarDays, X } from "lucide-react";
import EmailCard from "./EmailCard";
import EventCard from "./EventCard";
import { cn } from "@/lib/utils";

const FROM_YEAR = new Date().getFullYear() - 10;
const TO_YEAR = new Date().getFullYear() + 10;

interface CalendarViewProps {
  className?: string;
  caseId?: string;
  caseTitle?: string;
}

const CalendarView = ({ className, caseId, caseTitle }: CalendarViewProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [month, setMonth] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (caseId) {
          const eventsData = await eventController.fetchEventsByCase(caseId);
          setEvents(eventsData ?? []);
          setEmails([]);
        } else {
          const [emailsData, eventsData] = await Promise.all([
            emailController.fetchAllEmails(),
            eventController.fetchAllEvents(),
          ]);
          setEmails(emailsData);
          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Could not load your calendar data";
        toast({
          title: "Error loading calendar",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, caseId]);

  // Group events and emails by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, { emails: Email[]; events: Event[] }> = {};

    // Process emails
    emails.forEach((email) => {
      if (!email.date) return;

      let dateKey: string;
      try {
        // Try to parse the date
        if (email.date.includes("T")) {
          dateKey = format(new Date(email.date), "yyyy-MM-dd");
        } else if (email.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateKey = email.date;
        } else {
          const parsed = parse(email.date, "MM/dd/yyyy", new Date());
          if (isValid(parsed)) {
            dateKey = format(parsed, "yyyy-MM-dd");
          } else {
            return;
          }
        }
      } catch {
        return;
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = { emails: [], events: [] };
      }
      grouped[dateKey].emails.push(email);
    });

    // Process events
    events.forEach((event) => {
      if (!event.date) return;

      let dateKey: string;
      try {
        if (event.date.includes("T")) {
          dateKey = format(new Date(event.date), "yyyy-MM-dd");
        } else if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateKey = event.date;
        } else {
          const parsed = parse(event.date, "MM/dd/yyyy", new Date());
          if (isValid(parsed)) {
            dateKey = format(parsed, "yyyy-MM-dd");
          } else {
            return;
          }
        }
      } catch {
        return;
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = { emails: [], events: [] };
      }
      grouped[dateKey].events.push(event);
    });

    return grouped;
  }, [emails, events]);

  // Get items for selected date
  const selectedDateItems = useMemo(() => {
    if (!selectedDate) return { emails: [], events: [] };

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return itemsByDate[dateKey] || { emails: [], events: [] };
  }, [selectedDate, itemsByDate]);

  // Sort entries by time (events: date+time; emails: date)
  const sortedSelectedDateItems = useMemo(() => {
    const { emails: em, events: ev } = selectedDateItems;
    const sortEvents = [...ev].sort((a, b) => {
      const tA = parse(
        `${a.date} ${a.time ?? "00:00"}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      const tB = parse(
        `${b.date} ${b.time ?? "00:00"}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      if (!isValid(tA) || !isValid(tB)) return 0;
      return compareAsc(tA, tB);
    });
    const parseEmailDate = (email: Email): Date => {
      if (!email.date) return new Date(0);
      try {
        if (email.date.includes("T")) return new Date(email.date);
        if (email.date.match(/^\d{4}-\d{2}-\d{2}$/))
          return parse(email.date, "yyyy-MM-dd", new Date());
        const p = parse(email.date, "MM/dd/yyyy", new Date());
        return isValid(p) ? p : new Date(0);
      } catch {
        return new Date(0);
      }
    };
    const sortEmails = [...em].sort((a, b) =>
      compareAsc(parseEmailDate(a), parseEmailDate(b)),
    );
    return { emails: sortEmails, events: sortEvents };
  }, [selectedDateItems]);

  // Custom day renderer to show indicators
  const modifiers = useMemo(() => {
    const datesWithEmails: Date[] = [];
    const datesWithEvents: Date[] = [];
    const datesWithItems: Date[] = [];

    Object.keys(itemsByDate).forEach((dateKey) => {
      try {
        const date = parse(dateKey, "yyyy-MM-dd", new Date());
        if (isValid(date)) {
          datesWithItems.push(date);
          const dayItems = itemsByDate[dateKey];
          if (dayItems.emails.length > 0) {
            datesWithEmails.push(date);
          }
          if (dayItems.events.length > 0) {
            datesWithEvents.push(date);
          }
        }
      } catch {
        // Skip invalid dates
      }
    });

    return {
      hasItems: datesWithItems,
      hasEmails: datesWithEmails,
      hasEvents: datesWithEvents,
    };
  }, [itemsByDate]);

  const modifiersClassNames = {
    hasItems: "relative",
    hasEmails: "has-emails",
    hasEvents: "has-events",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-legal-200 rounded-full"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading calendar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-legal-100 rounded-lg shrink-0">
          <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-legal-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1">
            Calendar
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {caseId
              ? `Entries for this case only`
              : "View all events and emails organized by date"}
          </p>
        </div>
      </div>

      {caseId && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border bg-legal-50 border-legal-200">
          <p className="text-sm font-medium text-legal-900">
            Viewing calendar for:{" "}
            <span className="font-semibold">{caseTitle || "(this case)"}</span>
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/calendar" className="inline-flex items-center gap-2">
              <X className="h-4 w-4" />
              View all calendar
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="relative [&_.rdp-day]:relative">
                <style>{`
                  /* Email indicator (yellow) */
                  .rdp-day.has-emails:not(.has-events)::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: rgb(234, 179, 8);
                  }
                  /* Event indicator (blue) */
                  .rdp-day.has-events:not(.has-emails)::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: rgb(59, 130, 246);
                  }
                  /* Both indicators */
                  .rdp-day.has-emails.has-events::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: calc(50% - 3px);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: rgb(234, 179, 8);
                  }
                  .rdp-day.has-emails.has-events::before {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: calc(50% + 3px);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: rgb(59, 130, 246);
                  }
                `}</style>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={month}
                  onMonthChange={setMonth}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  captionLayout="dropdown-buttons"
                  fromYear={FROM_YEAR}
                  toYear={TO_YEAR}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Items */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate
                  ? format(selectedDate, "MMMM d, yyyy")
                  : "Select a date"}
              </CardTitle>
              {(sortedSelectedDateItems.emails.length > 0 ||
                sortedSelectedDateItems.events.length > 0) && (
                <div className="flex gap-2 text-sm text-muted-foreground flex-wrap">
                  {sortedSelectedDateItems.events.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {sortedSelectedDateItems.events.length} event
                      {sortedSelectedDateItems.events.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {!caseId && sortedSelectedDateItems.emails.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Mail className="h-3 w-3" />
                      {sortedSelectedDateItems.emails.length} email
                      {sortedSelectedDateItems.emails.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select a date to view items
                </p>
              ) : sortedSelectedDateItems.events.length === 0 &&
                sortedSelectedDateItems.emails.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No {caseId ? "entries" : "items"} for this date
                </p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Events first (sorted by time) */}
                  {sortedSelectedDateItems.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  {/* Then emails (when not filtered by case) */}
                  {!caseId &&
                    sortedSelectedDateItems.emails.map((email) => (
                      <EmailCard key={email.id} email={email} />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
