import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { caseController } from "@/backend/controllers/caseController";
import type { Case } from "@/backend/models/types";

interface LayoutProps {
  children: React.ReactNode;
  onAddEvent?: (eventData: Event, caseId?: string) => void;
  onCaseCreated?: () => void;
}
const Layout = ({ children, onAddEvent, onCaseCreated }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cases, setCases] = useState<{ id: string; title: string }[]>([]);

  const fetchCases = async () => {
    try {
      const casesData = await caseController.fetchAllCases();
      setCases(casesData.map((c: Case) => ({ id: c.id, title: c.title })));
    } catch (error) {
      console.error("Error fetching cases for header:", error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCaseCreated = async () => {
    await fetchCases();
    if (onCaseCreated) {
      onCaseCreated();
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onCaseCreated={onCaseCreated}
          />
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
