import {
  Calendar,
  Clock,
  Folder,
  Home,
  Kanban,
  Users,
  LogOut,
  UserCog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ProfileCard } from "@/components/ProfileCard";
import { supabase } from "@/integrations/supabase/client";

type View =
  | "dashboard"
  | "projects"
  | "tasks"
  | "clients"
  | "reports"
  | "settings";

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    id: "dashboard" as View,
    icon: Home,
  },
  {
    title: "Projects",
    id: "projects" as View,
    icon: Folder,
  },
  {
    title: "Tasks",
    id: "tasks" as View,
    icon: Kanban,
  },
  {
    title: "Clients",
    id: "clients" as View,
    icon: Users,
  },
  {
    title: "Reports",
    id: "reports" as View,
    icon: Clock,
  },
  {
    title: "Settings",
    id: "settings" as View,
    icon: UserCog,
    adminOnly: true,
  },
];

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { data: authData } = useAuth();
  const isAdmin = authData?.user?.role === "Admin";

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-transparent flex items-center justify-center">
            <img src="/logo.png" alt="Kitchen Logo" className="w-10 h-10" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Kitchen</h2>
            <p className="text-xs text-gray-500">Studio Bizkit</p>
          </div>
          <div className="w-10 h-10 bg-transparent flex items-center justify-center">
            <div></div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => {
                // Skip admin-only items if user is not admin
                if (item.adminOnly && !isAdmin) return null;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={currentView === item.id}
                      onClick={() => onViewChange(item.id)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <ProfileCard />
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="w-full mt-4"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
