import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { documentController } from "@/backend/controllers/documentController";
import { Case } from "@/backend/models/types";
import { Upload, Loader2 } from "lucide-react";

interface AttachDocumentButtonProps {
  cases: Case[];
  onDocumentAttached?: () => void;
  defaultCaseId?: string;
}

const AttachDocumentButton = ({
  cases,
  onDocumentAttached,
  defaultCaseId,
}: AttachDocumentButtonProps) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(defaultCaseId || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedCaseId || selectedCaseId === "none") {
      toast({
        title: "Please select a case",
        description: "You must select a case before uploading a document.",
        variant: "destructive",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsUploading(true);
      const document = await documentController.uploadDocumentToCase(
        file,
        selectedCaseId
      );

      if (document) {
        toast({
          title: "Document attached",
          description: `"${file.name}" has been successfully attached to the case.`,
        });
        // Reset form
        setSelectedCaseId("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Callback to refresh data if needed
        if (onDocumentAttached) {
          onDocumentAttached();
        }
      } else {
        throw new Error("Failed to upload document - no document returned");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Could not upload the document. Please check your Supabase bucket configuration.";
      toast({
        title: "Error uploading document",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (!selectedCaseId || selectedCaseId === "none") {
      toast({
        title: "Please select a case first",
        description: "Select a case before uploading a document.",
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  // Compact mode: if defaultCaseId is provided and there's only one case, hide dropdown
  const isCompactMode = defaultCaseId && cases.length === 1;

  return (
    <div className="flex items-center gap-3">
      {!isCompactMode && (
        <>
          <span className="text-sm font-medium text-muted-foreground">
            Attach document to case:
          </span>
          <Select
            value={selectedCaseId}
            onValueChange={setSelectedCaseId}
            disabled={isUploading}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a case..." />
            </SelectTrigger>
            <SelectContent>
              {cases.length === 0 ? (
                <SelectItem value="none" disabled>
                  No cases available
                </SelectItem>
              ) : (
                cases.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.title} {caseItem.number && `(${caseItem.number})`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={!selectedCaseId || selectedCaseId === "none" || isUploading}
        size="sm"
        variant="outline"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {isCompactMode ? "Upload Document" : "Upload Document"}
          </>
        )}
      </Button>
    </div>
  );
};

export default AttachDocumentButton;
