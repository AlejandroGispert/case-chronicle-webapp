import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { caseAccessController } from "@/backend/controllers/caseAccessController";
import type { CaseWithRelations } from "@/backend/models/types";

const CaseAccess = () => {
  const [caseCode, setCaseCode] = useState("");
  const [caseData, setCaseData] = useState<CaseWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccessCase = async () => {
    setLoading(true);
    try {
      const data = await caseAccessController.fetchPublicCase(caseCode.trim());

      if (!data) {
        throw new Error("Case not found");
      }

      setCaseData(data);
    } catch {
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
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>View Case (Read-only)</CardTitle>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CaseAccess;
