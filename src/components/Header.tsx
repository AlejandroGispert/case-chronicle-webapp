import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, LogOut } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/contexts/AuthContext";
import NewCaseModal from "@/components/NewCaseModal";

interface HeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  onCaseCreated?: () => void;
}

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  onCaseCreated,
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
      <div className="flex items-center justify-between h-full px-3 sm:px-4">
        <div className="flex items-center min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            className="lg:hidden mr-2 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-serif font-bold text-lg sm:text-xl truncate">
            My Cases
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* New Case Modal */}
          <NewCaseModal onCaseCreated={onCaseCreated} />

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={logout}
            size="icon"
            title="Logout"
            className="shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />
    </header>
  );
};

export default Header;
