import { useState, useEffect } from "react";
import { Case, Email, Event } from "../types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EmailTimeline from "./EmailTimeline";
import NewEmailModal from "./NewEmailModal";
import { Calendar, Mail, Folder } from "lucide-react";
import { format, isValid } from "date-fns";

interface CaseDetailProps {
  caseData: Case;
}

const CaseDetail = ({ caseData }: CaseDetailProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEmails(caseData.emails || []);
    setEvents(caseData.events || []);
  }, [caseData]);

  const handleAddEmail = (newEmail: Email, caseId: string) => {
    if (caseId === caseData.id) {
      setEmails((prev) => [...prev, newEmail]);
    }
  };

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      if (dateString.includes("T")) {
        const date = new Date(dateString);
        if (isValid(date)) return format(date, "MMM d, yyyy");
      }
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const totalCommunications = (emails.length || 0) + (events.length || 0);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <div>
            <h2 className="text-2xl font-serif font-semibold">{caseData.title}</h2>
            <p className="text-muted-foreground">{caseData.number}</p>
          </div>
          <Badge variant="outline" className={`${getStatusColor(caseData.status)} text-white px-3 py-1`}>
            {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <div className="flex items-center gap-3">
            <div className="bg-legal-50 p-2 rounded">
              <Folder className="h-6 w-6 text-legal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{caseData.client}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-legal-50 p-2 rounded">
              <Calendar className="h-6 w-6 text-legal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Created</p>
              <p className="font-medium">{formatDate(caseData.dateCreated)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-legal-50 p-2 rounded">
              <Mail className="h-6 w-6 text-legal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Communications</p>
              <p className="font-medium">{totalCommunications}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-medium font-serif">Communication Timeline</h3>
          <p className="text-sm text-muted-foreground">
            All communications and events related to this case
          </p>
        </div>

        <NewEmailModal
          cases={[{ id: caseData.id, title: caseData.title }]}
          onAddEmail={handleAddEmail}
        />

        <div className="pt-4 pb-6 px-6">
          <EmailTimeline emails={emails} events={events} />
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
