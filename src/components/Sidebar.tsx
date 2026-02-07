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
  Share2,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelectedCase } from "@/contexts/SelectedCaseContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { selectedCase } = useSelectedCase();

  return (
    <SidebarComponent className="h-full !border-r-0 [&>div>div:nth-child(2)]:!border-r-0 [&>div>div[data-sidebar='sidebar']]:!border-r-0">
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
                  <Link to="/select-case" className="flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Select Case
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/share-case" className="flex items-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Case
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Current case</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {selectedCase ? (
                  <SidebarMenuButton asChild>
                    <Link
                      to={`/case/${selectedCase.id}`}
                      className="flex items-center w-full"
                    >
                      <FileText className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{selectedCase.title}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild>
                    <Link to="/select-case" className="flex items-center w-full text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2 shrink-0" />
                      Select a case
                    </Link>
                  </SidebarMenuButton>
                )}
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
                    to="/select-case?status=active"
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
                    to="/select-case?status=closed"
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
