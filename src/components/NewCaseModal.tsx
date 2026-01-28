import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { caseController } from "@/backend/controllers/caseController";

// Add this type at the top with other imports
type CaseStatus = "active" | "pending" | "closed";

interface NewCaseModalProps {
  onCaseCreated?: () => void;
}

const NewCaseModal = ({ onCaseCreated }: NewCaseModalProps = {}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState<CaseStatus>("active");

  // Handle the case creation
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a case.",
        variant: "destructive",
      });
      return;
    }

    const caseData = {
      title,
      number: caseNumber, // Note: changed from caseNumber to number to match the schema
      client,
      status,
      user_id: user.id,
      date_created: new Date().toISOString(), // Add date_created field
    };

    try {
      const createdCase = await caseController.createNewCase(caseData);

      if (createdCase) {
        setOpen(false);
        // Reset form
        setTitle("");
        setCaseNumber("");
        setClient("");
        setStatus("active");

        toast({
          title: "Case Created",
          description: "Your new case has been created successfully",
        });

        // Call the callback to refresh cases list
        if (onCaseCreated) {
          onCaseCreated();
        }
      } else {
        throw new Error("Failed to create case");
      }
    } catch (error) {
      console.error("Error creating case:", error);
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-legal-300 hover:bg-legal-400 text-white">
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Enter the details for your new case.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateCase} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Case Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Smith vs Johnson"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caseNumber">Case Number (optional)</Label>
            <Input
              id="caseNumber"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Client Name (optional)</Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g., John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Case Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as CaseStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Create Case</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCaseModal;
