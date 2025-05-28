
import { Calendar, Clock, Folder, Home, Kanban, Users, LogOut } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"

type View = "dashboard" | "projects" | "kanban" | "clients" | "time"

interface AppSidebarProps {
  currentView: View
  onViewChange: (view: View) => void
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
    title: "Kanban",
    id: "kanban" as View,
    icon: Kanban,
  },
  {
    title: "Clients",
    id: "clients" as View,
    icon: Users,
  },
  {
    title: "Time Tracking",
    id: "time" as View,
    icon: Clock,
  },
]

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Kitchen</h2>
            <p className="text-xs text-gray-500">Studio Bizkit</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={currentView === item.id}
                    onClick={() => onViewChange(item.id)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{user?.email}</p>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
