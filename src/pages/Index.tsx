
import { useState, useEffect } from "react";
import { getCases } from "../data/mockData";
import { Case, Event } from "../types";
import Layout from "../components/Layout";
import CasesList from "../components/CasesList";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Index = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const location = useLocation();

  useEffect(() => {
    // Simulate loading from an API
    const fetchCases = async () => {
      try {
        // Artificial delay to simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        const casesData = getCases();
        
        // Ensure all cases have an events array
        const casesWithEvents = casesData.map(c => ({
          ...c,
          events: c.events || []
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
    // Parse the URL search params to get the status filter
    const params = new URLSearchParams(location.search);
    const statusFilter = params.get('status');
    
    if (statusFilter) {
      // Filter cases by status
      const filtered = cases.filter(c => c.status === statusFilter);
      setFilteredCases(filtered);
    } else {
      // No filter, show all cases
      setFilteredCases(cases);
    }
  }, [cases, location.search]);

  // Handle adding an event to a case
  const handleAddEvent = (eventData: Event) => {
    // In a real app, we'd add this to the selected case
    // For demo purposes, add it to the first case or a specific case
    if (cases.length > 0) {
      const updatedCases = [...cases];
      const caseToUpdate = updatedCases[0]; // First case for demo
      
      caseToUpdate.events = [...(caseToUpdate.events || []), eventData];
      setCases(updatedCases);
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
              <p className="mt-2 text-sm text-muted-foreground">Loading cases...</p>
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