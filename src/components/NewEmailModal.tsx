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
import { Mail } from "lucide-react";

interface NewEmailModalProps {
  cases?: { id: string; title: string }[];
  onAddEmail: (emailData: Email, caseId: string) => void;
}

const NewEmailModal = ({ cases = [], onAddEmail }: NewEmailModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const { toast } = useToast();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  const resetForm = () => {
    setSelectedCaseId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setTime(
      new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const subject = formData.get("emailSubject")?.toString() || "";
    const sender = formData.get("emailSender")?.toString() || "";
    const recipient = formData.get("emailRecipient")?.toString() || "";
    const content = formData.get("emailContent")?.toString() || "";

    if (!selectedCaseId || !subject || !sender || !recipient || !content) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    const emailData: Email = {
      id: uuidv4(),
      case_id: selectedCaseId,
      subject,
      sender,
      recipient,
      date,
      time,
      content,
      attachments: [], // Can be extended later
      created_at: new Date().toISOString(),
      user_id: "", // Assigned by backend
    };

    onAddEmail(emailData, selectedCaseId);
    toast({
      title: "Email Added",
      description: "Email successfully assigned to the case.",
    });
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="flex-shrink-0">
          <Mail className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">add new email to a case</span>
          <span className="sm:hidden">New Email</span>
        </Button>
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
            <Label htmlFor="case">Select Case</Label>
            <Select
              value={selectedCaseId ?? ""}
              onValueChange={setSelectedCaseId}
            >
              <SelectTrigger id="case">
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
            <Label htmlFor="emailSubject">Email Subject</Label>
            <Input id="emailSubject" name="emailSubject" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailSender">Sender</Label>
            <Input id="emailSender" name="emailSender" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailRecipient">Recipient</Label>
            <Input id="emailRecipient" name="emailRecipient" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailContent">Email Content</Label>
            <textarea
              id="emailContent"
              name="emailContent"
              className="w-full h-32 rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailDate">Date</Label>
              <Input
                id="emailDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailTime">Time</Label>
              <Input
                id="emailTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
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
