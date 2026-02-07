import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { caseController } from "@/backend/controllers/caseController";
import { useToast } from "@/hooks/use-toast";
import { useSelectedCase } from "@/contexts/SelectedCaseContext";
import type { Case } from "@/backend/models/types";
import { format } from "date-fns";
import { Calendar, FileText, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SelectCase = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { toast } = useToast();
  const { selectedCase, setSelectedCase } = useSelectedCase();

  const statusFilter = new URLSearchParams(location.search).get("status");

  useEffect(() => {
    const state = location.state as { caseId?: string; caseTitle?: string } | null;
    if (state?.caseId && state?.caseTitle) {
      setSelectedCase({ id: state.caseId, title: state.caseTitle });
    }
  }, [location.state, setSelectedCase]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await caseController.fetchAllCases();
        setCases(data);
      } catch (error) {
        console.error("Error loading cases:", error);
        const message =
          error instanceof Error ? error.message : "Could not load cases";
        toast({
          title: "Error loading cases",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [toast]);

  const filteredCases =
    statusFilter === "active" || statusFilter === "closed"
      ? cases.filter((c) => c.status === statusFilter)
      : cases;

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await caseController.fetchAllCases();
      setCases(data);
    } catch (error) {
      console.error("Error refreshing cases:", error);
      toast({
        title: "Error",
        description: "Could not refresh cases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout onCaseCreated={handleRefresh}>
      <div className="space-y-6 mt-4">
        <p className="text-sm sm:text-base text-muted-foreground">
          Choose a case to work with. It will be used across Calendar and Case
          details.
        </p>

        {selectedCase && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">Selected:</span>
                <span className="min-w-0 truncate">{selectedCase.title}</span>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Link to="/calendar">
                    <span className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                      <Calendar className="h-4 w-4" />
                      Calendar
                    </span>
                  </Link>
                  <Link to={`/case/${selectedCase.id}`}>
                    <span className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                      <FileText className="h-4 w-4" />
                      Case details
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
                  >
                    <X className="h-4 w-4" />
                    Deselect
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <p className="mt-2 text-sm text-muted-foreground">
                Loading cases...
              </p>
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">No cases</h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Create a case from the header to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {filteredCases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <Card
                  key={c.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    isSelected && "ring-2 ring-primary bg-primary/5"
                  )}
                  onClick={() =>
                    setSelectedCase({ id: c.id, title: c.title })
                  }
                >
                  <CardContent className="flex items-center gap-3 py-3">
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{c.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.client}
                        {c.number && ` · ${c.number}`}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        c.status === "active" && "bg-green-500/20 text-green-700",
                        c.status === "closed" && "bg-gray-500/20 text-gray-700"
                      )}
                    >
                      {c.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(c.date_created), "MMM d, yyyy")}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SelectCase;
