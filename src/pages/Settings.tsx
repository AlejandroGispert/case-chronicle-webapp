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
import { Settings as SettingsIcon, AlertTriangle, Trash2, Download } from "lucide-react";
import { caseController } from "@/backend/controllers/caseController";
import { dataExportController } from "@/backend/controllers/dataExportController";
import { useToast } from "@/hooks/use-toast";

type CaseOption = { id: string; title: string; number: string };

const Settings = () => {
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
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

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

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

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const json = await dataExportController.exportUserData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `case-chronicles-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Data exported",
        description: "Your data has been downloaded as JSON.",
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
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Export all your data as JSON (GDPR Art. 20 - data portability).
              </p>
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={exportLoading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {exportLoading ? "Exporting…" : "Export my data"}
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
