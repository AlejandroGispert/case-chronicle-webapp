import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Phone, Briefcase } from "lucide-react";
import { caseController } from "@/backend/controllers/caseController";
import { contactController } from "@/backend/controllers/contactController";
import { Contact, Case } from "@/backend/models/types";
import NewContactModal from "./NewContactModal";

interface ContactsByCase {
  caseId: string;
  caseTitle: string;
  caseNumber: string;
  contacts: Contact[];
}

const ContactsList = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [contactsByCase, setContactsByCase] = useState<ContactsByCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalCaseId, setAddModalCaseId] = useState<string | null>(null);
  const hasSetInitialTab = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [casesData, allContacts] = await Promise.all([
        caseController.fetchAllCases(),
        contactController.fetchAllContacts(),
      ]);
      setCases(casesData);

      const map = new Map<string, ContactsByCase>();
      for (const c of casesData) {
        map.set(c.id, {
          caseId: c.id,
          caseTitle: c.title,
          caseNumber: c.number,
          contacts: allContacts.filter((ct) => ct.case_id === c.id),
        });
      }
      const arr = Array.from(map.values()).sort((a, b) =>
        a.caseTitle.localeCompare(b.caseTitle)
      );
      setContactsByCase(arr);
      if (arr.length > 0 && !hasSetInitialTab.current) {
        setSelectedCaseId(arr[0].caseId);
        hasSetInitialTab.current = true;
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = (caseId: string) => {
    setAddModalCaseId(caseId);
    setAddModalOpen(true);
  };

  const handleContactAdded = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-primary/20 rounded-full" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading contacts…
          </p>
        </div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No cases found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create a case first, then add contacts from the Contacts page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedCaseId || contactsByCase[0]?.caseId}
        onValueChange={setSelectedCaseId}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {contactsByCase.map((group) => (
            <TabsTrigger
              key={group.caseId}
              value={group.caseId}
              className="whitespace-nowrap"
            >
              {group.caseTitle}
              <Badge variant="secondary" className="ml-2">
                {group.contacts.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {contactsByCase.map((group) => (
          <TabsContent
            key={group.caseId}
            value={group.caseId}
            className="mt-4"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{group.caseTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    Case #{group.caseNumber} • {group.contacts.length} contact
                    {group.contacts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="default"
                  onClick={() => openAddModal(group.caseId)}
                  className="shrink-0"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add contact
                </Button>
              </div>

              {group.contacts.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No contacts for this case yet.</p>
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => openAddModal(group.caseId)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add first contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {group.contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {addModalCaseId && (
        <NewContactModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          caseId={addModalCaseId}
          onContactAdded={handleContactAdded}
        />
      )}
    </div>
  );
};

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{contact.name}</h4>
              {contact.role && (
                <Badge variant="outline" className="text-xs">
                  {contact.role}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:underline truncate"
                  >
                    {contact.email}
                  </a>
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="hover:underline"
                  >
                    {contact.phone}
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactsList;
