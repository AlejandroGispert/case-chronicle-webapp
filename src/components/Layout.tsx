
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  onAddEvent?: (eventData: Event, caseId?: string) => void;
}
const Layout = ({ children, onAddEvent }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
 
          <main className="flex-1 overflow-auto p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
