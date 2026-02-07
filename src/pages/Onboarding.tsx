import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authController } from "@/backend/controllers/authController";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Mail } from "lucide-react";

const Onboarding = () => {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();

  const handleContinue = async () => {
    setSaving(true);
    try {
      // New users get Individual by default; Business will use a separate login flow later.
      await authController.updateProfile({ business_model: "individual" });
      await refreshProfile();
      toast({
        title: "Welcome",
        description: "You're all set. Start managing your cases.",
      });
      navigate("/home", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not continue";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6 overflow-auto">
      <Card className="w-full max-w-md shrink-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg sm:text-xl break-words">
            Welcome to Case Chronicle
          </CardTitle>
          <CardDescription className="break-words text-sm">
            A simple way to organize your cases, correspondence, and documents in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Create and manage cases with titles and details.</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Link emails and attachments to cases for a clear timeline.</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Upload documents and keep everything in one place.</span>
            </li>
          </ul>
          <Button
            className="w-full"
            onClick={handleContinue}
            disabled={saving}
          >
            {saving ? "Setting up…" : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
