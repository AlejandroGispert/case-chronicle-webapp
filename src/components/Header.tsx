import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, LogOut } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/contexts/AuthContext";
import NewEventModal from "@/components/NewEventModal";

interface HeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  onAddEvent?: (eventData: any, caseId: string) => void;
  cases?: { id: string; title: string }[];
}

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  onAddEvent,
  cases = [],
}: HeaderProps) => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Email Sent",
      description: "Your email has been successfully sent",
    });
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(true);
    } else if (setSidebarOpen) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            className="lg:hidden mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-serif font-bold text-xl">My Cases</h1>
        </div>

        <div className="flex items-center gap-4">
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
