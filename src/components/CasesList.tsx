import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Case } from "../types";
import CaseDetail from "./CaseDetail";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, WifiOff } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"; // You might need to create or import this
import NewCaseModal from "./NewCaseModal";
import NewEventModal from "./NewEventModal";
import ShareCaseModal from "./ShareCaseModal";
import { FileText, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

interface CasesListProps {
  cases: Case[];
  onRefresh?: () => void;
  onAddEvent?: (eventData: any, caseId: string) => void;
}

const CasesList = ({ cases, onRefresh, onAddEvent }: CasesListProps) => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<"date" | "title" | "client">("date");
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 1000);

    // Online/offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const filteredAndSortedCases = cases
    .filter(
      (c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.number.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.dateCreated).getTime();
        const dateB = new Date(b.dateCreated).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "title") {
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        return sortDirection === "asc"
          ? a.client.localeCompare(b.client)
          : b.client.localeCompare(a.client);
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const handleCaseSelect = (caseItem: Case) => {
    setSelectedCase(caseItem);
  };

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <WifiOff className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Internet Connection</h2>
        <p className="text-muted-foreground">
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Spinner /> {/* Replace with your spinner component */}
        <span className="ml-2 text-muted-foreground">Loading cases...</span>
      </div>
    );
  }

  // Show empty state when there are no cases at all
  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-serif font-semibold mb-2">No Cases Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Get started by creating your first case. You can track all your legal
          matters, documents, and communications in one place.
        </p>
        <NewCaseModal onCaseCreated={onRefresh} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Search and Sort */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: "date" | "title" | "client") =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              className="w-full sm:w-[130px]"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </div>

        {/* Case List */}
        <div className="space-y-3">
          {filteredAndSortedCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedCase?.id === caseItem.id
                  ? "border-legal-300 ring-1 ring-legal-300"
                  : ""
              }`}
              onClick={() => handleCaseSelect(caseItem)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-medium text-base truncate">
                      {caseItem.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {caseItem.number}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(caseItem.status)} text-white shrink-0`}
                  >
                    {caseItem.status.charAt(0).toUpperCase() +
                      caseItem.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm">{caseItem.client}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(caseItem.dateCreated)}
                  </p>
                </div>
                {onAddEvent && (
                  <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                    <NewEventModal
                      caseId={caseItem.id}
                      onAddEvent={onAddEvent}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-shrink-0"
                      asChild
                    >
                      <Link
                        to={`/calendar?caseId=${caseItem.id}&caseTitle=${encodeURIComponent(caseItem.title)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Calendar</span>
                        <span className="sm:hidden">Cal.</span>
                      </Link>
                    </Button>
                    <ShareCaseModal
                      caseId={caseItem.id}
                      caseTitle={caseItem.title}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredAndSortedCases.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No cases found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail view */}
      <div className="lg:col-span-2">
        {selectedCase ? (
          <CaseDetail caseData={selectedCase} />
        ) : (
          <div className="h-full flex items-center justify-center border rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-semibold mb-2">
                Select a Case
              </h2>
              <p className="text-muted-foreground">
                Choose a case from the list to view details and communication
                timeline.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Format date to a more readable format
const formatDate = (dateString: string) => {
  if (!dateString) return "";

  try {
    if (dateString.includes("T")) {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, "MMM d, yyyy");
      }
    }

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
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

export default CasesList;
