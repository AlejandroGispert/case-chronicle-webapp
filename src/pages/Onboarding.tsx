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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6 overflow-auto">
      <Card className="w-full max-w-md shrink-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg sm:text-xl break-words">
            Choose your account type
          </CardTitle>
          <CardDescription className="break-words text-sm">
            This helps us tailor your experience and payment options. You can change this later in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Button
            variant="outline"
            className="w-full h-auto min-h-0 py-4 sm:py-5 flex flex-col items-center gap-2 text-left"
            onClick={() => handleSelect("b2b")}
            disabled={saving}
          >
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
            <span className="font-semibold break-words text-center">B2B – Business</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground break-words text-center max-w-full">
              For firms, teams, and organizations. Invoicing and team plans.
            </span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-auto min-h-0 py-4 sm:py-5 flex flex-col items-center gap-2 text-left"
            onClick={() => handleSelect("b2c")}
            disabled={saving}
          >
            <User className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
            <span className="font-semibold break-words text-center">B2C – Individual</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground break-words text-center max-w-full">
              For individuals and sole practitioners. Simple subscription.
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
