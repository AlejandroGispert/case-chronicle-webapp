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

const NewCaseModal = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("active");

  // Handle the case creation
  const handleCreateCase = async (e: React.FormEvent) => {
  e.preventDefault();

  const caseData = {
    title,
    caseNumber,
    client,
    status,
    user_id: user.id,
  };

  try {
    const response = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
    });

    const createdCase = await response.json();

    if (response.ok) {
      setOpen(false);
      toast({
        title: "Case Created",
        description: "Your new case has been created successfully",
      });
    } else {
      toast({
        title: "Error",
        description: createdCase.message || "An error occurred.",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "An unexpected error occurred.",
      variant: "destructive",
    });
    console.error(error);
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-legal-300 hover:bg-legal-400 text-white">
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Enter the details for your new legal case.
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
            <Label htmlFor="caseNumber">Case Number</Label>
            <Input
              id="caseNumber"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g., L-2024-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Client Name</Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g., John Smith"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Case Status</Label>
            <Select value={status} onValueChange={setStatus}>
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
