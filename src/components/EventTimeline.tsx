import { Event } from "@/types";
import EventCard from "./EventCard";
import { parse, isValid, compareAsc } from "date-fns";

interface EventTimelineProps {
  events: Event[];
}

const EventTimeline = ({ events }: EventTimelineProps) => {
  if (!events || events.length === 0)
    return (
      <p className="text-sm text-muted-foreground">No events available.</p>
    );

  const sortedEvents = [...events].sort((a, b) => {
    const dateTimeA = parse(
      `${a.date} ${a.time}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    const dateTimeB = parse(
      `${b.date} ${b.time}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );

    if (!isValid(dateTimeA) || !isValid(dateTimeB)) return 0;
    return compareAsc(dateTimeA, dateTimeB);
  });

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {sortedEvents.map((event, index) => (
        <EventCard key={index} event={event} />
      ))}
    </div>
  );
};

export default EventTimeline;
