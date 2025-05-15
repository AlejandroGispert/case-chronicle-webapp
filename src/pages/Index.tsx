import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Case, Event } from "../types";
import Layout from "../components/Layout";
import CasesList from "../components/CasesList";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from("cases")
          .select("*, events(*)");

        if (error) {
          throw error;
        }

        const casesWithEvents = data.map((c) => ({
          ...c,
          events: c.events || [],
        }));

        setCases(casesWithEvents);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusFilter = params.get("status");

    if (statusFilter) {
      setFilteredCases(cases.filter((c) => c.status === statusFilter));
    } else {
      setFilteredCases(cases);
    }
  }, [cases, location.search]);

  const handleAddEvent = async (eventData: Event, caseId?: string) => {
    const targetCaseId = caseId || (cases[0]?.id ?? "");

    try {
      const { error } = await supabase
        .from("events")
        .insert([{ ...eventData, case_id: targetCaseId }]);

      if (error) throw error;

      // Re-fetch or locally update
      setCases((prev) =>
        prev.map((c) =>
          c.id === targetCaseId
            ? { ...c, events: [...(c.events || []), eventData] }
            : c
        )
      );
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <Layout onAddEvent={handleAddEvent}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-1">Your Cases</h1>
          <p className="text-muted-foreground">
            Manage and view all your cases in one place
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-legal-200 rounded-full"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading cases...
              </p>
            </div>
          </div>
        ) : (
          <CasesList cases={filteredCases} />
        )}
      </div>
    </Layout>
  );
};

export default Index;
