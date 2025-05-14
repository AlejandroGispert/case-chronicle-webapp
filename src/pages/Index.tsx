import { useState, useEffect } from "react";
import { getCases } from "../data/mockData";
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
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulated delay
        const casesData = getCases();

        // Ensure all cases have events array
        const casesWithEvents = casesData.map((c) => ({
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

  const handleAddEvent = (eventData: Event, caseId?: string) => {
    setCases((prevCases) => {
      return prevCases.map((c) =>
        (caseId ? c.id === caseId : c === prevCases[0]) // fallback to first case
          ? {
              ...c,
              events: [...(c.events || []), eventData],
            }
          : c
      );
    });
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
