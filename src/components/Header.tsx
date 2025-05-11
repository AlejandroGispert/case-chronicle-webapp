import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, Mail, LogOut } from "lucide-react";
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
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NewEventModal from "@/components/NewEventModal";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onAddEvent: (eventData: any, caseId: string) => void;
  cases: { id: string; title: string }[];
}

const Header = ({ sidebarOpen, setSidebarOpen, onAddEvent, cases }: HeaderProps) => {
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Email Sent",
      description: "Your email has been successfully sent",
    });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-serif font-bold text-xl">My Cases</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Send Email Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Send Email to Case</DialogTitle>
                <DialogDescription>
                  Send an email that will be automatically stored in the selected case.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSendEmail} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Send to Case Email</Label>
                  <Input id="email" defaultValue="cases@mycases.com" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Email subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <textarea 
                    id="body"
                    className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    placeholder="Type your message here"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachment</Label>
                  <Input id="attachment" type="file" />
                </div>
                <DialogFooter>
                  <Button type="submit">Send Email</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* New Event Modal */}
          <NewEventModal
            cases={cases}
            onAddEvent={(eventData, caseId) => {
              if (onAddEvent) onAddEvent(eventData, caseId);
            }}
          />

          {/* Logout */}
          <Button variant="ghost" onClick={logout} size="icon" title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />
    </header>
  );
};

export default Header;
