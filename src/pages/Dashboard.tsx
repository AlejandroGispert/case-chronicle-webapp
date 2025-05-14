import { useState, useEffect } from "react";
import Header from "../components/Header";
import Layout from "../components/Layout";
import CasesList from "../components/CasesList";
import { useLocation } from "react-router-dom";
import { caseController } from "@/backend/controllers/caseController";
import { eventController } from "@/backend/controllers/eventController";
import { useToast } from "@/hooks/use-toast";
import { Event as DbEvent, CreateEventInput } from "@/backend/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { Case } from "@/types";
import { format } from "date-fns";

// Converts Supabase case + events to app-level structure
const mapDatabaseCaseToAppCase = (dbCase: any): Case => {
  return {
    id: dbCase.id,
    title: dbCase.title,
    number: dbCase.number,
    client: dbCase.client,
    status: dbCase.status,
    dateCreated: dbCase.date_created,
    emails: dbCase.emails || [],
    events: Array.isArray(dbCase.events)
      ? dbCase.events.map((event: DbEvent) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          type: 'event',
          case_id: event.case_id,
          created_at: event.created_at,
          event_type: event.event_type,
          user_id: event.user_id,
        }))
      : [],
  };
};

const Dashboard = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCases, setFilteredCases] = useState<any[]>([]);
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const casesData = await caseController.fetchAllCases();
        const casesWithEvents = await Promise.all(
          casesData.map(async (c: any) => {
            const events = await eventController.fetchEventsByCase(c.id);
            return {
              ...c,
              events: events || [],
            };
          })
        );
        setCases(casesWithEvents);
      } catch (error: any) {
        console.error("Error fetching cases:", error);
        toast({
          title: "Error loading cases",
          description: error.message || "Could not load your cases",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusFilter = params.get("status");

    if (statusFilter) {
      const filtered = cases.filter((c) => c.status === statusFilter);
      setFilteredCases(filtered);
    } else {
      setFilteredCases(cases);
    }
  }, [cases, location.search]);

  const handleAddEvent = async (eventData: any, caseId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add events",
        variant: "destructive",
      });
      return;
    }

    if (!caseId) {
      toast({
        title: "Missing Case",
        description: "Please select a case for the event.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formattedDate = format(new Date(eventData.date), "yyyy-MM-dd");
      const formattedTime = typeof eventData.time === "string" ? eventData.time : "12:00";

    const newEventData: CreateEventInput = {
  ...eventData,
  case_id: caseId,
  user_id: user.id,
  date: formattedDate,
  time: formattedTime,
};

      const newEvent = await eventController.createNewEvent(newEventData);

      if (newEvent) {
        setCases((prevCases) =>
          prevCases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  events: [...(c.events || []), newEvent].sort((a, b) =>
                    new Date(`${a.date}T${a.time}`).getTime() -
                    new Date(`${b.date}T${b.time}`).getTime()
                  ),
                }
              : c
          )
        );

        toast({
          title: "Event added",
          description: "The event was added successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast({
        title: "Error adding event",
        description: error.message || "Could not add the event",
        variant: "destructive",
      });
    }
  };

  const mappedCases = filteredCases.map(mapDatabaseCaseToAppCase);

  return (
    <Layout>
      <Header
        sidebarOpen={false}
        setSidebarOpen={() => {}}
        onAddEvent={handleAddEvent}
        cases={mappedCases.map(({ id, title }) => ({ id, title }))}
      />

      <div className="space-y-6 mt-4">
        
        <p className="text-muted-foreground mb-4">
          Manage and view all your cases in one place
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-legal-200 rounded-full"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading cases...</p>
            </div>
          </div>
        ) : (
          <CasesList cases={mappedCases} />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
