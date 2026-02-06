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

function toDateKey(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  try {
    if (s.includes("T")) {
      const d = new Date(s);
      return isValid(d) ? format(d, "yyyy-MM-dd") : null;
    }
    const p = parse(s, "MM/dd/yyyy", new Date());
    return isValid(p) ? format(p, "yyyy-MM-dd") : null;
  } catch {
    return null;
  }
}

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
          console.log(`[CalendarView] Fetched ${eventsData?.length ?? 0} events for case ${caseId}:`, eventsData);
          // Log each event's date to debug
          if (eventsData && eventsData.length > 0) {
            eventsData.forEach((event, idx) => {
              console.log(`[CalendarView] Event ${idx}:`, {
                id: event.id,
                date: event.date,
                dateType: typeof event.date,
                dateKey: toDateKey(event.date),
                fullEvent: event
              });
            });
          }
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

    emails.forEach((email) => {
      const dateKey = toDateKey(email.date);
      if (!dateKey) {
        console.warn("[CalendarView] Skipping email with invalid date:", email.date, email);
        return;
      }
      if (!grouped[dateKey]) grouped[dateKey] = { emails: [], events: [] };
      grouped[dateKey].emails.push(email);
    });

    events.forEach((event) => {
      console.log("[CalendarView] Processing event:", {
        id: event.id,
        date: event.date,
        dateType: typeof event.date,
        dateValue: event.date,
        fullEvent: event
      });
      const dateKey = toDateKey(event.date);
      console.log("[CalendarView] Date key result:", dateKey);
      if (!dateKey) {
        console.warn("[CalendarView] Skipping event with invalid date:", event.date, event);
        return;
      }
      if (!grouped[dateKey]) grouped[dateKey] = { emails: [], events: [] };
      grouped[dateKey].events.push(event);
      console.log("[CalendarView] Added event to date:", dateKey);
    });

    console.log("[CalendarView] Grouped items by date:", grouped);
    console.log("[CalendarView] Total dates with items:", Object.keys(grouped).length);
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
    const timeStr = (t: string | null | undefined) =>
      (t ?? "00:00").slice(0, 5);
    const sortEvents = [...ev].sort((a, b) => {
      const tA = parse(
        `${a.date} ${timeStr(a.time)}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      const tB = parse(
        `${b.date} ${timeStr(b.time)}`,
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
        } else {
          console.warn("[CalendarView] Invalid date parsed from key:", dateKey);
        }
      } catch (error) {
        console.warn("[CalendarView] Error parsing date key:", dateKey, error);
      }
    });

    console.log("[CalendarView] Modifiers calculated:", {
      hasEvents: datesWithEvents.length,
      hasEmails: datesWithEmails.length,
      hasItems: datesWithItems.length,
      eventDates: datesWithEvents.map(d => format(d, "yyyy-MM-dd")),
    });

    return {
      hasItems: datesWithItems,
      hasEmails: datesWithEmails,
      hasEvents: datesWithEvents,
    };
  }, [itemsByDate]);

  const modifiersClassNames = {
    hasItems: "relative has-items",
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
              <div className="relative calendar-day-dots">
                <style>{`
                  /* Fix dropdown caption layout - center and align properly */
                  .calendar-day-dots .rdp-caption {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 1rem !important;
                    margin-bottom: 1rem !important;
                    flex-wrap: nowrap !important;
                  }

                  /* Hide the default caption label that shows "February 2026" */
                  .calendar-day-dots .rdp-caption_label {
                    display: none !important;
                  }

                  /* Style the dropdown container - ensure proper layout */
                  .calendar-day-dots .rdp-dropdown {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 0.5rem !important;
                    margin: 0 !important;
                  }

                  /* Style the month and year dropdowns */
                  .calendar-day-dots .rdp-dropdown_year,
                  .calendar-day-dots .rdp-dropdown_month {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 0.5rem !important;
                    margin: 0 !important;
                  }

                  /* Style the select elements - clean appearance */
                  .calendar-day-dots select.rdp-dropdown {
                    appearance: none !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    display: inline-block !important;
                    padding: 0.5rem 2.5rem 0.5rem 0.75rem !important;
                    border-radius: 0.375rem !important;
                    border: 1px solid hsl(var(--input)) !important;
                    background-color: hsl(var(--background)) !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    cursor: pointer !important;
                    min-width: 120px !important;
                    text-align: left !important;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
                    background-position: right 0.5rem center !important;
                    background-repeat: no-repeat !important;
                    background-size: 1rem !important;
                    margin: 0 !important;
                  }

                  /* Hide any labels or text that appears before/after dropdowns */
                  .calendar-day-dots .rdp-dropdown_month::before,
                  .calendar-day-dots .rdp-dropdown_year::before,
                  .calendar-day-dots .rdp-dropdown_month::after,
                  .calendar-day-dots .rdp-dropdown_year::after {
                    content: none !important;
                  }

                  /* Hide any label elements */
                  .calendar-day-dots label {
                    display: none !important;
                  }

                  /* Hide any text nodes that might be showing "Month:" or "Year:" */
                  .calendar-day-dots .rdp-caption > *:not(.rdp-dropdown) {
                    display: none !important;
                  }

                  /* Ensure dropdowns are the only visible elements in caption */
                  .calendar-day-dots .rdp-caption > .rdp-dropdown {
                    display: inline-flex !important;
                  }

                  /* Base day styling: larger, centered date numbers - target button inside cell */
                  .calendar-day-dots button.day {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    height: 2.75rem !important;
                    width: 2.75rem !important;
                    margin: 0 auto !important;
                    border-radius: 9999px !important;
                    font-size: 1rem !important;
                    font-weight: 600 !important;
                    position: relative !important;
                    min-width: 2.75rem !important;
                  }

                  @media (min-width: 640px) {
                    .calendar-day-dots button.day {
                      height: 3rem !important;
                      width: 3rem !important;
                      min-width: 3rem !important;
                      font-size: 1.1rem !important;
                    }
                  }

                  /* Days with entries: background color (selected/today keep their style) */
                  /* Target multiple possible class combinations for react-day-picker compatibility */
                  .calendar-day-dots button.day.has-events:not(.day_selected):not(.day_today),
                  .calendar-day-dots .day.has-events:not(.day_selected):not(.day_today),
                  .calendar-day-dots [role="gridcell"] button.has-events:not(.day_selected):not(.day_today),
                  .calendar-day-dots button.has-events:not(.day_selected):not(.day_today) {
                    background-color: #E4E7F0 !important;
                  }
                  .calendar-day-dots button.day.has-emails:not(.has-events):not(.day_selected):not(.day_today),
                  .calendar-day-dots .day.has-emails:not(.has-events):not(.day_selected):not(.day_today),
                  .calendar-day-dots [role="gridcell"] button.has-emails:not(.has-events):not(.day_selected):not(.day_today),
                  .calendar-day-dots button.has-emails:not(.has-events):not(.day_selected):not(.day_today) {
                    background-color: #FEF3C7 !important;
                  }
                  .calendar-day-dots button.day.has-emails.has-events:not(.day_selected):not(.day_today),
                  .calendar-day-dots .day.has-emails.has-events:not(.day_selected):not(.day_today),
                  .calendar-day-dots button.has-emails.has-events:not(.day_selected):not(.day_today) {
                    background-color: #E4E7F0 !important;
                  }
                  .calendar-day-dots button.day.has-events:hover:not(.day_selected):not(.day_today),
                  .calendar-day-dots button.day.has-emails:hover:not(.day_selected):not(.day_today),
                  .calendar-day-dots .day.has-events:hover:not(.day_selected):not(.day_today),
                  .calendar-day-dots .day.has-emails:hover:not(.day_selected):not(.day_today),
                  .calendar-day-dots button.has-events:hover:not(.day_selected):not(.day_today),
                  .calendar-day-dots button.has-emails:hover:not(.day_selected):not(.day_today) {
                    background-color: #D1D5E4 !important;
                  }

                  /* Explicit indicator dot for days that have events */
                  .calendar-day-dots button.day.has-events::after,
                  .calendar-day-dots .day.has-events::after,
                  .calendar-day-dots button.has-events::after {
                    content: "" !important;
                    position: absolute !important;
                    bottom: 0.25rem !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: 0.4rem !important;
                    height: 0.4rem !important;
                    border-radius: 9999px !important;
                    background-color: #4B6BFB !important;
                    z-index: 10 !important;
                  }

                  /* Ensure selected/today days still show properly */
                  .calendar-day-dots button.day.day_selected.has-events::after,
                  .calendar-day-dots button.day.day_today.has-events::after,
                  .calendar-day-dots .day.day_selected.has-events::after,
                  .calendar-day-dots .day.day_today.has-events::after,
                  .calendar-day-dots button.day_selected.has-events::after,
                  .calendar-day-dots button.day_today.has-events::after {
                    background-color: rgba(255, 255, 255, 0.9) !important;
                  }

                  /* Make sure cells accommodate larger buttons */
                  .calendar-day-dots .cell {
                    height: auto !important;
                    width: auto !important;
                    min-height: 2.75rem !important;
                    min-width: 2.75rem !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                  }

                  @media (min-width: 640px) {
                    .calendar-day-dots .cell {
                      min-height: 3rem !important;
                      min-width: 3rem !important;
                    }
                  }

                  /* Align header cells with day cells */
                  .calendar-day-dots .head_cell {
                    width: 2.75rem !important;
                    min-width: 2.75rem !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                  }

                  @media (min-width: 640px) {
                    .calendar-day-dots .head_cell {
                      width: 3rem !important;
                      min-width: 3rem !important;
                    }
                  }

                  /* Ensure header row is properly aligned */
                  .calendar-day-dots .head_row {
                    display: flex !important;
                    width: 100% !important;
                    justify-content: space-between !important;
                  }

                  /* Ensure table rows align properly */
                  .calendar-day-dots .row {
                    display: flex !important;
                    width: 100% !important;
                    justify-content: space-between !important;
                  }

                  /* Debug: Add border to see if modifier classes are applied */
                  .calendar-day-dots button.has-events,
                  .calendar-day-dots .day.has-events {
                    border: 2px solid #4B6BFB !important;
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
                  captionLayout="dropdown"
                  fromYear={FROM_YEAR}
                  toYear={TO_YEAR}
                  numberOfMonths={1}
                  className="rounded-md border"
                  classNames={{
                    day: cn(
                      "h-11 w-11 text-base font-semibold",
                      "sm:h-12 sm:w-12 sm:text-lg"
                    ),
                    cell: "h-11 w-11 sm:h-12 sm:w-12",
                  }}
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
