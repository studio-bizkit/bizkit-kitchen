
import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Dashboard } from "@/components/Dashboard"
import { Projects } from "@/components/Projects"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

type View = "dashboard" | "projects" | "kanban" | "clients" | "time"

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard")

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />
      case "projects":
        return <Projects />
      case "kanban":
        return <KanbanBoard />
      case "clients":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-500">Client management coming soon...</p>
          </div>
        )
      case "time":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-500">Time tracking features coming soon...</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 p-4 lg:hidden">
            <SidebarTrigger>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SidebarTrigger>
          </header>
          
          <div className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Index
