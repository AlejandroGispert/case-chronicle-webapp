import { useState, useEffect } from "react";
import { Event } from "@/types";
import { CalendarDays, Clock, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parse } from "date-fns";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    try {
      if (timeString.match(/^\d{1,2}:\d{2}$/)) {
        const [hours, minutes] = timeString.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes
          .toString()
          .padStart(2, "0")} ${period}`;
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className={`w-full transition-all duration-300 ${
        isExpanded ? "h-auto" : "h-24"
      } cursor-pointer`}
      onClick={toggleExpand}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-full ${
                currentEvent.event_type === "Email"
                  ? "bg-yellow-100"
                  : "bg-blue-100"
              }`}
            >
              {currentEvent.event_type === "Email" ? (
                <Mail className="h-4 w-4 text-yellow-600" />
              ) : (
                <CalendarDays className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <h3 className="font-medium">{currentEvent.title}</h3>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {formatDate(currentEvent.date)} at {formatTime(currentEvent.time)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <p
          className={`text-sm transition-all duration-300 ${
            isExpanded ? "h-auto" : "h-8 overflow-hidden"
          }`}
        >
          {currentEvent.description}
        </p>
        {isExpanded && currentEvent.event_type && (
          <Badge className="mt-2" variant="outline">
            {currentEvent.event_type}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
