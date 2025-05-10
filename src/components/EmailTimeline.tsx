
import { Email, Event } from "../types";
import { Separator } from "@/components/ui/separator";
import EmailCard from "./EmailCard";
import EventCard from "./EventCard";

interface TimelineItem {
  id: string;
  date: string;
  time: string;
  type: 'email' | 'event';
  data: Email | Event;
}

interface EmailTimelineProps {
  emails: Email[];
  events?: Event[];
}

const EmailTimeline = ({ emails, events = [] }: EmailTimelineProps) => {
  console.log("Timeline received emails:", emails?.length || 0);
  console.log("Timeline received events:", events?.length || 0, events);
  
  // Combine emails and events into a single timeline
  const timelineItems: TimelineItem[] = [
    ...emails.map(email => ({
      id: email.id,
      date: email.date,
      time: email.time,
      type: 'email' as const,
      data: email
    })),
    ...events.map(event => ({
      id: event.id,
      date: event.date,
      time: event.time,
      type: 'event' as const,
      data: event
    }))
  ];

  console.log("Timeline items before sorting:", timelineItems.length);

  // Normalize date and time strings for comparison
  const normalizeDateTime = (dateStr: string, timeStr: string) => {
    try {
      // Handle ISO format dates
      if (dateStr.includes('T')) {
        return new Date(dateStr).getTime();
      }
      
      // Handle various date formats
      let dateParts;
      if (dateStr.includes('-')) {
        dateParts = dateStr.split('-').map(Number);
      } else if (dateStr.includes('/')) {
        dateParts = dateStr.split('/').map(Number);
      } else {
        // If we can't parse, return original string for basic comparison
        return dateStr + timeStr;
      }
      
      // If date has year-month-day format
      let year, month, day;
      if (dateParts[0] > 1000) { // Assume YYYY-MM-DD
        [year, month, day] = dateParts;
      } else { // Assume MM/DD/YYYY or DD/MM/YYYY (defaulting to MM/DD/YYYY)
        [month, day, year] = dateParts;
      }
      
      // Parse time
      let hours = 0, minutes = 0;
      if (timeStr) {
        const timeParts = timeStr.replace(/\s*(AM|PM)\s*$/i, '').split(':').map(Number);
        [hours, minutes] = timeParts;
        
        // Handle AM/PM
        if (/PM/i.test(timeStr) && hours < 12) {
          hours += 12;
        } else if (/AM/i.test(timeStr) && hours === 12) {
          hours = 0;
        }
      }
      
      const date = new Date(year, month - 1, day, hours, minutes);
      return date.getTime();
    } catch (error) {
      console.error("Error parsing date/time:", error, dateStr, timeStr);
      // Fallback to string comparison
      return dateStr + " " + timeStr;
    }
  };

  // Sort timeline items by date and time (newest first)
  const sortedItems = [...timelineItems].sort((a, b) => {
    const dateTimeA = normalizeDateTime(a.date, a.time);
    const dateTimeB = normalizeDateTime(b.date, b.time);
    
    if (typeof dateTimeA === 'number' && typeof dateTimeB === 'number') {
      return dateTimeB - dateTimeA; // newest first
    } else {
      // Fallback to string comparison
      return String(dateTimeB).localeCompare(String(dateTimeA));
    }
  });

  console.log("Sorted timeline items:", sortedItems.length);

  return (
    <div className="relative timeline pb-6 px-6">
      {sortedItems.length > 0 ? (
        <div className="space-y-6 relative">
          {sortedItems.map((item, index) => (
            <div key={item.id} className="timeline-item relative pl-12">
              <div className="timeline-dot absolute left-0 top-2 w-4 h-4 bg-legal-500 rounded-full"></div>
              {item.type === 'email' ? (
                <EmailCard email={item.data as Email} />
              ) : (
                <EventCard event={item.data as Event} />
              )}
              {index < sortedItems.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No communications found for this case.</p>
        </div>
      )}
    </div>
  );
};

export default EmailTimeline;
