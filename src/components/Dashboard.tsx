import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Square, Calendar, Users, CheckCircle2, Folder } from "lucide-react"

// Mock data - will be replaced with Supabase data
const mockProjects = [
  {
    id: 1,
    name: "Brand Redesign",
    client: "TechCorp Inc.",
    status: "In Progress",
    progress: 65,
    dueDate: "2024-06-15",
    team: ["John", "Sarah", "Mike"],
    type: "Client"
  },
  {
    id: 2,
    name: "Website Optimization",
    client: "Internal",
    status: "Planning",
    progress: 20,
    dueDate: "2024-07-01",
    team: ["Emma", "David"],
    type: "Internal"
  },
  {
    id: 3,
    name: "Mobile App Design",
    client: "StartupXYZ",
    status: "Review",
    progress: 90,
    dueDate: "2024-05-30",
    team: ["Alex", "Lisa"],
    type: "Client"
  }
]

const mockTasks = [
  { id: 1, title: "Review client feedback", project: "Brand Redesign", priority: "High" },
  { id: 2, title: "Update wireframes", project: "Website Optimization", priority: "Medium" },
  { id: 3, title: "Final presentation prep", project: "Mobile App Design", priority: "High" },
]

export function Dashboard() {
  const [isTracking, setIsTracking] = useState(false)
  const [trackingTime, setTrackingTime] = useState("00:00:00")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Planning": return "bg-yellow-100 text-yellow-800"
      case "Review": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "border-l-red-500"
      case "Medium": return "border-l-yellow-500"
      case "Low": return "border-l-green-500"
      default: return "border-l-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your projects.</p>
        </div>
        
        {/* Time Tracking */}
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-lg">{trackingTime}</span>
              </div>
              <Button
                size="sm"
                variant={isTracking ? "destructive" : "default"}
                onClick={() => setIsTracking(!isTracking)}
                className={isTracking ? "" : "bg-primary hover:bg-primary/90"}
              >
                {isTracking ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <Folder className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Hours This Week</p>
                <p className="text-2xl font-bold text-gray-900">32.5</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your current projects and their progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.client}</p>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {project.dueDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.team.length} members
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockTasks.map((task) => (
              <div key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)} pl-4 py-2`}>
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-500">{task.project}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {task.priority}
                  </Badge>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
