import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import DocumentsList from "../components/DocumentsList";
import { useSelectedCase } from "@/contexts/SelectedCaseContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { selectedCase } = useSelectedCase();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-1">Documents</h1>
          <p className="text-muted-foreground">
            View and manage all documents organized by case
          </p>
        </div>

        {!selectedCase && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium text-muted-foreground">
              Select a case to focus the view on one case.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/select-case">Select case</Link>
            </Button>
          </div>
        )}

        <DocumentsList />
      </div>
    </Layout>
  );
};

export default Index;
