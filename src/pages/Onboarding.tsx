import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authController } from "@/backend/controllers/authController";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { BusinessModel } from "@/backend/models/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User } from "lucide-react";

const Onboarding = () => {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();

  const handleSelect = async (model: BusinessModel) => {
    setSaving(true);
    try {
      await authController.updateProfile({ business_model: model });
      await refreshProfile();
      toast({
        title: "Account type set",
        description: model === "b2b" ? "You're set up as a business account." : "You're set up as an individual account.",
      });
      navigate("/home", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save";
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choose your account type</CardTitle>
          <CardDescription>
            This helps us tailor your experience and payment options. You can change this later in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => handleSelect("b2b")}
            disabled={saving}
          >
            <Building2 className="h-8 w-8" />
            <span className="font-semibold">B2B – Business</span>
            <span className="text-sm font-normal text-muted-foreground">
              For firms, teams, and organizations. Invoicing and team plans.
            </span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => handleSelect("b2c")}
            disabled={saving}
          >
            <User className="h-8 w-8" />
            <span className="font-semibold">B2C – Individual</span>
            <span className="text-sm font-normal text-muted-foreground">
              For individuals and sole practitioners. Simple subscription.
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
