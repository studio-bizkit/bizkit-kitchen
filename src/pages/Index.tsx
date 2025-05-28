import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Dashboard } from "@/components/Dashboard"
import { Projects } from "@/components/Projects"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Clients } from "@/components/Clients"
import { Users } from "@/components/Users"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider"
import { LoginForm } from "@/components/auth/LoginForm"

type View = "dashboard" | "projects" | "tasks" | "clients" | "reports" | "settings"

function AppContent() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />
      case "projects":
        return <Projects />
      case "tasks":
        return <KanbanBoard />
      case "clients":
        return <Clients />
      case "reports":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500">Reports and analytics are being built, give bilal some time...</p>
          </div>
        )
      case "settings":
        return <Users />
      default:
        return <Dashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 p-4 lg:hidden">
            <SidebarTrigger>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SidebarTrigger>
          </header>
          
          <div className="flex-1 p-6 overflow-auto bg-white dark:bg-black">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default Index
