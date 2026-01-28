import { useState, useEffect } from "react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Calendar,
  File,
  Home,
  Mail,
  Settings,
  Info,
  Users,
  ChevronDown,
  ChevronRight,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { caseController } from "@/backend/controllers/caseController";
import { Case } from "@/backend/models/types";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [sharedCases, setSharedCases] = useState<Case[]>([]);
  const [isSharedCasesOpen, setIsSharedCasesOpen] = useState(false);
  const [isLoadingSharedCases, setIsLoadingSharedCases] = useState(false);

  useEffect(() => {
    const fetchSharedCases = async () => {
      setIsLoadingSharedCases(true);
      try {
        const cases = await caseController.fetchSharedCases();
        setSharedCases(cases);
      } catch (error) {
        console.error("Error fetching shared cases:", error);
        setSharedCases([]);
      } finally {
        setIsLoadingSharedCases(false);
      }
    };

    fetchSharedCases();
  }, []);

  return (
    <SidebarComponent className={`border-r h-full`}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/inbox" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Inbox
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/calendar" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/documents" className="flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    Documents
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/contacts" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Contacts
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Case Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/dashboard?status=active"
                    className="flex items-center w-full"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    Active Cases
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/dashboard?status=closed"
                    className="flex items-center w-full"
                  >
                    <div className="h-2 w-2 rounded-full bg-gray-500 mr-2" />
                    Closed Cases
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible
            open={isSharedCasesOpen}
            onOpenChange={setIsSharedCasesOpen}
          >
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1 -mx-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Shared Cases
                  </div>
                  {isSharedCasesOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {isLoadingSharedCases ? (
                    <SidebarMenuItem>
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        Loading...
                      </div>
                    </SidebarMenuItem>
                  ) : sharedCases.length === 0 ? (
                    <SidebarMenuItem>
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        No shared cases
                      </div>
                    </SidebarMenuItem>
                  ) : (
                    sharedCases.map((caseItem) => (
                      <SidebarMenuItem key={caseItem.id}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={`/case/${caseItem.id}?readonly=true`}
                            className="flex items-center w-full"
                          >
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                            <span className="truncate">{caseItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/about" className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;
