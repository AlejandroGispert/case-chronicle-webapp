import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import ShareCaseModal from "../components/ShareCaseModal";
import { caseController } from "@/backend/controllers/caseController";
import { caseShareController } from "@/backend/controllers/caseShareController";
import { caseShareInviteController } from "@/backend/controllers/caseShareInviteController";
import { useToast } from "@/hooks/use-toast";
import { Case } from "@/backend/models/types";
import type { SharedUserWithPermissions } from "@/backend/models/caseShareModel";
import type { PendingInvite } from "@/backend/models/caseShareInviteModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, FileText, Eye, Pencil, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const ShareCase = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharedUsersByCase, setSharedUsersByCase] = useState<
    Record<string, SharedUserWithPermissions[]>
  >({});
  const [pendingInvitesByCase, setPendingInvitesByCase] = useState<
    Record<string, PendingInvite[]>
  >({});
  const { toast } = useToast();

  const fetchSharedAndPending = useCallback(async (caseIds: string[]) => {
    if (caseIds.length === 0) return { shared: {}, pending: {} };
    const results = await Promise.all(
      caseIds.map(async (id) => {
        try {
          const [users, invites] = await Promise.all([
            caseShareController.getSharedUsers(id),
            caseShareInviteController.getPendingInvites(id),
          ]);
          return { caseId: id, users, invites };
        } catch {
          return { caseId: id, users: [], invites: [] };
        }
      }),
    );
    return {
      shared: Object.fromEntries(results.map((r) => [r.caseId, r.users])),
      pending: Object.fromEntries(results.map((r) => [r.caseId, r.invites])),
    };
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const casesData = await caseController.fetchAllCases();
        setCases(casesData);
        const { shared, pending } = await fetchSharedAndPending(casesData.map((c) => c.id));
        setSharedUsersByCase(shared);
        setPendingInvitesByCase(pending);
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
  }, [toast, fetchSharedAndPending]);

  const handleShareSuccess = useCallback(async () => {
    const ids = cases.map((c) => c.id);
    const { shared, pending } = await fetchSharedAndPending(ids);
    setSharedUsersByCase(shared);
    setPendingInvitesByCase(pending);
  }, [cases, fetchSharedAndPending]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-6 w-6 text-legal-600" />
          <h1 className="text-2xl font-serif font-semibold">Share Case</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Select a case to share with other users
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-legal-200 rounded-full"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading cases...
              </p>
            </div>
          </div>
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-serif font-semibold mb-2">
                No Cases Yet
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                You don't have any cases to share yet. Create a case from the
                Dashboard to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-serif line-clamp-2">
                      {caseItem.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(caseItem.status)} text-white`}
                    >
                      {getStatusLabel(caseItem.status)}
                    </Badge>
                  </div>
                  {caseItem.number && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Case #{caseItem.number}
                    </p>
                  )}
                  {caseItem.client && (
                    <p className="text-sm text-muted-foreground">
                      Client: {caseItem.client}
                    </p>
                  )}
                  {caseItem.date_created && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Created:{" "}
                      {format(new Date(caseItem.date_created), "MMM d, yyyy")}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-end">
                    <ShareCaseModal
                      caseId={caseItem.id}
                      caseTitle={caseItem.title}
                      onShareSuccess={handleShareSuccess}
                    />
                  </div>
                  {(() => {
                    const shared = sharedUsersByCase[caseItem.id] ?? [];
                    const pending = pendingInvitesByCase[caseItem.id] ?? [];
                    if (shared.length === 0 && pending.length === 0) return null;
                    return (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Shared with
                        </p>
                        <ul className="space-y-1.5">
                          {shared.map((u) => (
                            <li
                              key={u.id}
                              className="flex items-center justify-between text-sm gap-2"
                            >
                              <span className="truncate">{u.email}</span>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                {u.can_edit ? (
                                  <>
                                    <Pencil className="h-3 w-3 mr-1" /> Edit
                                  </>
                                ) : u.can_view ? (
                                  <>
                                    <Eye className="h-3 w-3 mr-1" /> View
                                  </>
                                ) : (
                                  "No access"
                                )}
                              </Badge>
                            </li>
                          ))}
                          {pending.map((inv) => (
                            <li
                              key={inv.id}
                              className="flex items-center justify-between text-sm gap-2"
                            >
                              <span className="truncate">{inv.email}</span>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0 border-amber-300 text-amber-700"
                              >
                                <Clock className="h-3 w-3 mr-1" /> Invited
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShareCase;
