import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import EmailCard from "../components/EmailCard";
import AttachDocumentButton from "../components/AttachDocumentButton";
import { emailController } from "@/backend/controllers/emailController";
import { caseController } from "@/backend/controllers/caseController";
import { useToast } from "@/hooks/use-toast";
import { Email, Case } from "@/backend/models/types";
import { Mail, Inbox as InboxIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Inbox = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningEmailId, setAssigningEmailId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [emailsData, casesData] = await Promise.all([
          emailController.fetchUnassignedEmails(),
          caseController.fetchAllCases(),
        ]);
        setEmails(emailsData);
        setCases(casesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not load your emails";
        toast({
          title: "Error loading inbox",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleAssignToCase = async (emailId: string, caseId: string) => {
    if (!caseId || caseId === "none") {
      toast({
        title: "Please select a case",
        description: "You must select a case to assign this email to.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAssigningEmailId(emailId);
      const success = await emailController.assignEmailToCase(emailId, caseId);
      
      if (success) {
        toast({
          title: "Email assigned",
          description: "The email has been assigned to the case successfully.",
        });
        // Remove the email from the inbox
        setEmails((prev) => prev.filter((e) => e.id !== emailId));
      } else {
        throw new Error("Failed to assign email");
      }
    } catch (error) {
      console.error("Error assigning email:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not assign the email to the case";
      toast({
        title: "Error assigning email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAssigningEmailId(null);
    }
  };

  const handleEmailUpdate = async (updatedEmail: Email) => {
    // Update email in the list if needed
    setEmails((prev) =>
      prev.map((e) => (e.id === updatedEmail.id ? updatedEmail : e))
    );
  };

  return (
    <Layout>
      <div className="space-y-6 mt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-legal-100 rounded-lg">
            <InboxIcon className="h-6 w-6 text-legal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Inbox</h1>
            <p className="text-muted-foreground">
              Review and assign received emails to cases
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-legal-200 rounded-full"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading emails...</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Your inbox is empty</p>
              <p className="text-sm text-muted-foreground text-center">
                All emails have been assigned to cases. New unassigned emails will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                {emails.length} unassigned email{emails.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Attach Document Section */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <AttachDocumentButton cases={cases} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {emails.map((email) => (
                <Card key={email.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <EmailCard email={email} onUpdate={handleEmailUpdate} />
                      
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <span className="text-sm font-medium text-muted-foreground">
                          Assign to case:
                        </span>
                        <Select
                          onValueChange={(value) => handleAssignToCase(email.id, value)}
                          disabled={assigningEmailId === email.id}
                        >
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select a case..." />
                          </SelectTrigger>
                          <SelectContent>
                            {cases.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No cases available
                              </SelectItem>
                            ) : (
                              cases.map((caseItem) => (
                                <SelectItem key={caseItem.id} value={caseItem.id}>
                                  {caseItem.title} {caseItem.number && `(${caseItem.number})`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {assigningEmailId === email.id && (
                          <span className="text-sm text-muted-foreground">Assigning...</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inbox;
