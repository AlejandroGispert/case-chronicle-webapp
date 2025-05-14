import { useState, useEffect } from "react";
import { Event } from "@/types";
import { CalendarDays, Clock, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
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
              <h3 className="font-medium text-base truncate">
                {currentEvent.title || "No Title"}
              </h3>
            </div>

            <div
              className={cn("transition-all duration-200 overflow-hidden", {
                "max-h-16": !isExpanded,
                "max-h-full": isExpanded,
              })}
            >
              <p className="text-sm whitespace-pre-line">
                {currentEvent.description?.trim() || "(No description provided)"}
              </p>
            </div>

            {currentEvent.description && currentEvent.description.length > 100 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto mt-2 text-legal-500 hover:text-legal-600"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>

          <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatDate(currentEvent.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(currentEvent.time)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
