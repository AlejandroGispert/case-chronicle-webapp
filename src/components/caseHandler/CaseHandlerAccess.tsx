import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

const CaseHandlerAccess = () => {
  const [caseCode, setCaseCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter a valid case code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await (supabase as any)
      .from("case_access_codes")
      .select("case_id")
      .eq("code", caseCode.trim())
      .single();
    
      if (error || !data?.case_id) {
        throw new Error("Code not found");
      }

      // Redirect to read-only case view using the internal ID
      navigate(`/case/${data.case_id}?readonly=true`);
    } catch (error) {
      toast({
        title: "Access denied",
        description: "Invalid or inaccessible case code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleAccess}>
          <CardHeader>
            <CardTitle className="text-2xl">Case Handler Access</CardTitle>
            <CardDescription>Enter the code to view a case in read-only mode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caseCode">Case Code</Label>
              <Input
                id="caseCode"
                type="text"
                placeholder="Enter case code"
                value={caseCode}
                onChange={(e) => setCaseCode(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "View Case"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CaseHandlerAccess;
