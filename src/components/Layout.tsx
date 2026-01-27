
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { caseController } from "@/backend/controllers/caseController";

interface LayoutProps {
  children: React.ReactNode;
  onAddEvent?: (eventData: Event, caseId?: string) => void;
}
const Layout = ({ children, onAddEvent }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cases, setCases] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const casesData = await caseController.fetchAllCases();
        setCases(casesData.map((c: any) => ({ id: c.id, title: c.title })));
      } catch (error) {
        console.error("Error fetching cases for header:", error);
      }
    };
    fetchCases();
  }, []);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            onAddEvent={onAddEvent}
            cases={cases}
          />
          <main className="flex-1 overflow-auto p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
