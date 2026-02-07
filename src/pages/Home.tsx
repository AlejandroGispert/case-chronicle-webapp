import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { caseController } from "@/backend/controllers/caseController";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Mail, File } from "lucide-react";

const Home = () => {
  const { profile } = useAuth();
  const [caseCount, setCaseCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const cases = await caseController.fetchAllCases();
        setCaseCount(cases.length);
      } catch {
        setCaseCount(0);
      }
    };
    fetchCount();
  }, []);

  const firstName = profile?.first_name?.trim() || "there";

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-1">Welcome, {firstName}</h1>
          <p className="text-muted-foreground">
            Your case management hub. Select a case to get started or jump to a section below.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="text-2xl font-bold">{caseCount ?? "—"}</div>
              <p className="text-xs text-muted-foreground">Total cases</p>
              <div className="mt-auto pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/select-case">Select case</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calendar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-xs text-muted-foreground">Events and deadlines</p>
              <div className="mt-auto pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/calendar">Open calendar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inbox</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-xs text-muted-foreground">Case-related emails</p>
              <div className="mt-auto pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/inbox">Open inbox</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <File className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-xs text-muted-foreground">View and manage documents</p>
              <div className="mt-auto pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/documents">Open documents</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
