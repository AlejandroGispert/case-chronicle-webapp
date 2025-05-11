
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Case } from "../types";
import CaseDetail from "./CaseDetail";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format, isValid, parse } from "date-fns";

interface CasesListProps {
  cases: Case[];
}

const CasesList = ({ cases }: CasesListProps) => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Handle selection of a case
  const handleCaseSelect = (caseItem: Case) => {
    console.log("Selected case with events:", caseItem.events);
    setSelectedCase(caseItem);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-3">
          {filteredCases.map((caseItem) => (
            <Card 
              key={caseItem.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedCase?.id === caseItem.id ? 'border-legal-300 ring-1 ring-legal-300' : ''
              }`}
              onClick={() => handleCaseSelect(caseItem)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-medium text-base truncate">{caseItem.title}</h3>
                    <p className="text-sm text-muted-foreground">{caseItem.number}</p>
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(caseItem.status)} text-white shrink-0`}>
                    {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm">{caseItem.client}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(caseItem.dateCreated)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredCases.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No cases found matching your search.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="lg:col-span-2">
        {selectedCase ? (
          <CaseDetail caseData={selectedCase} />
        ) : (
          <div className="h-full flex items-center justify-center border rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-semibold mb-2">Select a Case</h2>
              <p className="text-muted-foreground">
                Choose a case from the list to view details and communication timeline.
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
  if (!dateString) return '';
  
  try {
    // Check if it's a full ISO date
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy');
      }
    }
    
    // Try to parse YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        return format(parsedDate, 'MMM d, yyyy');
      }
    }
    
    return dateString;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export default CasesList;