import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CaseData {
  id: string;
  title: string;
  status: string;
  description: string;
  createdAt?: string;
}

const CaseAccess = () => {
  const [caseCode, setCaseCode] = useState("");
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccessCase = async () => {
    setLoading(true);

    try {
      // Step 1: Fetch the case_id using the case code
      const { data: mapping, error: mappingError } = await supabase
        .from("case_access_codes")
        .select("case_id")
        .eq("code", caseCode.trim())
        .single();

      if (mappingError || !mapping?.case_id) {
        throw new Error("Invalid or missing case mapping");
      }

      // Step 2: Fetch the case data using the case_id
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select("id, title, status, description, date_created")
        .eq("id", mapping.case_id)
        .single();

      if (caseError || !caseData) {
        throw new Error("Case not found");
      }

      setCaseData({
        id: caseData.id,
        title: caseData.title,
        status: caseData.status,
        description: caseData.description,
        createdAt: caseData.date_created,
      });
    } catch (error) {
      toast({
        title: "Invalid Code",
        description: "Could not find a case with that code.",
        variant: "destructive",
      });
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Enter Case Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caseCode">Case Code</Label>
              <Input
                id="caseCode"
                value={caseCode}
                onChange={(e) => setCaseCode(e.target.value)}
                placeholder="e.g. ABC123"
                required
              />
            </div>
            <Button onClick={handleAccessCase} disabled={loading || !caseCode}>
              {loading ? "Loading..." : "View Case"}
            </Button>
          </CardContent>
        </Card>

        {caseData && (
          <Card>
            <CardHeader>
              <CardTitle>{caseData.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-700">
              <p><strong>ID:</strong> {caseData.id}</p>
              <p><strong>Status:</strong> {caseData.status}</p>
              <p><strong>Description:</strong> {caseData.description}</p>
              {caseData.createdAt && (
                <p><strong>Created At:</strong> {new Date(caseData.createdAt).toLocaleString()}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CaseAccess;
