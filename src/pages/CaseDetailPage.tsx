import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import CaseDetail from "@/components/CaseDetail";
import { caseController } from "@/backend/controllers/caseController";
import { Event as DbEvent, CaseWithRelations } from "@/backend/models/types";
import { Case } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

function mapCaseWithRelationsToAppCase(dbCase: CaseWithRelations): Case {
  return {
    id: dbCase.id,
    title: dbCase.title,
    number: dbCase.number,
    client: dbCase.client,
    status: dbCase.status as "active" | "pending" | "closed",
    dateCreated: dbCase.date_created,
    emails: dbCase.emails ?? [],
    events: Array.isArray(dbCase.events)
      ? dbCase.events.map((event: DbEvent) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          type: "event",
          case_id: event.case_id,
          created_at: event.created_at,
          event_type: event.event_type,
          user_id: event.user_id,
        }))
      : [],
  };
}

const CaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get("readonly") === "true";

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const data = await caseController.fetchCaseWithDetails(id);
        if (!mounted) return;
        if (!data) {
          setNotFound(true);
          setCaseData(null);
          return;
        }
        setCaseData(mapCaseWithRelationsToAppCase(data));
      } catch {
        if (mounted) {
          setNotFound(true);
          setCaseData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Spinner />
          <p className="text-muted-foreground">Loading case…</p>
        </div>
      </Layout>
    );
  }

  if (notFound || !caseData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <h2 className="text-xl font-semibold">Case not found</h2>
          <p className="text-muted-foreground">
            This case does not exist or you don’t have access to it.
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to cases
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to cases
          </Link>
        </Button>
        <CaseDetail caseData={caseData} readonly={readonly} />
      </div>
    </Layout>
  );
};

export default CaseDetailPage;
