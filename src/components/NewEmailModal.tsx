import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { Email } from "../types";

interface NewEmailModalProps {
  cases?: { id: string; title: string }[];
  onAddEmail: (emailData: Email, caseId: string) => void;
}

const NewEmailModal = ({ cases = [], onAddEmail }: NewEmailModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const emailData: Email = {
      id: uuidv4(),
      case_id: selectedCaseId!, // Add case_id
      subject: formData.get("emailSubject")?.toString() || "",
      sender: formData.get("emailSender")?.toString() || "",
      recipient: formData.get("emailRecipient")?.toString() || "",
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }), // Format as HH:mm
      content: formData.get("emailContent")?.toString() || "",
      attachments: [],
    };

    if (selectedCaseId) {
      onAddEmail(emailData, selectedCaseId);
      toast({
        title: "Email Added",
        description: "Email successfully assigned to the case.",
      });
      setOpen(false);
    } else {
      toast({
        title: "No Case Selected",
        description: "Please select a case before submitting.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Assign Email to Case</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Email to Case</DialogTitle>
          <DialogDescription>
            Assign a new email to one of your cases.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddEmail} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Select Case</Label>
            <Select onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Email Subject</Label>
            <Input name="emailSubject" required />
          </div>
          <div className="space-y-2">
            <Label>Sender</Label>
            <Input name="emailSender" required />
          </div>
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Input name="emailRecipient" required />
          </div>
          <div className="space-y-2">
            <Label>Email Content</Label>
            <textarea
              name="emailContent"
              className="w-full h-32 rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Email</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewEmailModal;
