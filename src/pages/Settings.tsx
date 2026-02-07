import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Settings as SettingsIcon,
  AlertTriangle,
  Trash2,
  Download,
  Building2,
  User,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { caseController } from "@/backend/controllers/caseController";
import { dataExportController } from "@/backend/controllers/dataExportController";
import { authController } from "@/backend/controllers/authController";
import { billingController } from "@/backend/controllers/billingController";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { BusinessModel } from "@/backend/models/types";
import type { SubscriptionInfo } from "@/backend/services/payment.types";

type CaseOption = { id: string; title: string; number: string };

const Settings = () => {
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [businessModelSaving, setBusinessModelSaving] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [billingLoading, setBillingLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const isGoogleUser = user?.provider === "google";
  const { toast } = useToast();

  const fetchCases = useCallback(async () => {
    try {
      const data = await caseController.fetchAllCases();
      setCases(
        (data || []).map(
          (c: { id: string; title: string; number: string }) => ({
            id: c.id,
            title: c.title,
            number: c.number,
          }),
        ),
      );
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast({
        title: "Error loading cases",
        description: "Could not load cases.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const info = await billingController.getSubscription();
        setSubscription(info);
      } catch {
        setSubscription({
          status: "none",
          planId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      }
    };
    loadSubscription();
  }, []);

  const handleUpgrade = async () => {
    setBillingLoading(true);
    try {
      const planId =
        profile?.business_model === "business"
          ? "plan_business"
          : "plan_individual";
      const { url, error } = await billingController.getCheckoutUrl(planId);
      if (error) {
        toast({ title: "Billing", description: error, variant: "destructive" });
        return;
      }
      if (url) window.location.href = url;
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const { url, error } = await billingController.getPortalUrl();
      if (error) {
        toast({ title: "Billing", description: error, variant: "destructive" });
        return;
      }
      if (url) window.location.href = url;
    } finally {
      setBillingLoading(false);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const handleBusinessModelChange = async (value: BusinessModel) => {
    setBusinessModelSaving(true);
    try {
      await authController.updateProfile({ business_model: value });
      await refreshProfile();
      toast({
        title: "Account type updated",
        description:
          value === "business"
            ? "You're now set as a business account."
            : "You're now set as an individual account.",
      });
    } catch (error) {
      console.error("Error updating business model:", error);
      toast({
        title: "Update failed",
        description: "Could not update account type.",
        variant: "destructive",
      });
    } finally {
      setBusinessModelSaving(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!selectedCaseId) return;
    try {
      const ok = await caseController.removeCase(selectedCaseId);
      if (ok) {
        toast({
          title: "Case deleted",
          description: "The case has been permanently removed.",
        });
        setSelectedCaseId(null);
        setDeleteDialogOpen(false);
        await fetchCases();
      } else {
        toast({
          title: "Delete failed",
          description: "Could not delete the case.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting case:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the case.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async (format: "json" | "text") => {
    setExportLoading(true);
    try {
      const content = await dataExportController.exportUserData(format);
      const isJson = format === "json";
      const blob = new Blob([content], {
        type: isJson ? "application/json" : "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `case-chronicles-export-${new Date().toISOString().slice(0, 10)}.${isJson ? "json" : "txt"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Data exported",
        description: isJson
          ? "Your data has been downloaded as JSON (machine-readable)."
          : "Your data has been downloaded as readable text.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export your data.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences and configuration.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Configure your account preferences and profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Account type
              </Label>
              <Select
                value={profile?.business_model ?? ""}
                onValueChange={(v) => {
                  if (v === "business" || v === "individual")
                    handleBusinessModelChange(v);
                }}
                disabled={businessModelSaving || isGoogleUser}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Choose account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Business
                    </span>
                  </SelectItem>
                  <SelectItem value="individual">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Individual
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Export all your data (GDPR Art. 20 – data portability). Choose
                readable text or JSON for machine portability.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportData("text")}
                  disabled={exportLoading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exportLoading ? "Exporting…" : "Export as text"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData("json")}
                  disabled={exportLoading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exportLoading ? "Exporting…" : "Export as JSON"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & subscription
            </CardTitle>
            <CardDescription>
              Manage your plan. Individual and Business plans are available
              based on your account type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription && (
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span className="font-medium capitalize">
                  {subscription.status}
                </span>
                {subscription.planId && ` · Plan: ${subscription.planId}`}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleUpgrade}
                disabled={billingLoading || subscription?.status === "active"}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {subscription?.status === "active" ? "Current plan" : "Upgrade"}
              </Button>
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={billingLoading}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Manage subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Integration</CardTitle>
            <CardDescription>
              Manage your email forwarding and case addresses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email integration settings will be available here soon.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Control how and when you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification preferences will be available here soon.
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Destructive
            </CardTitle>
            <CardDescription>
              Permanently delete a case. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select case to delete
              </label>
              <Select
                value={selectedCaseId ?? ""}
                onValueChange={(v) => setSelectedCaseId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title} ({c.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="destructive"
              disabled={!selectedCaseId}
              onClick={() => {
                setConfirmTitle("");
                setDeleteDialogOpen(true);
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete case
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete case</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    Delete case &quot;{selectedCase?.title ?? "?"}&quot;? This
                    action cannot be undone.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-title">
                      Type the case title to confirm
                    </Label>
                    <Input
                      id="confirm-title"
                      value={confirmTitle}
                      onChange={(e) => setConfirmTitle(e.target.value)}
                      placeholder={selectedCase?.title ?? ""}
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={
                  !selectedCaseId ||
                  confirmTitle.trim() !== (selectedCase?.title ?? "").trim()
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteCase();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Settings;
