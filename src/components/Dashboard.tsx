
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Square, Calendar, Users, CheckCircle2, Folder } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useTasks } from "@/hooks/useTasks"
import { useActiveTimeEntry, useStartTimeTracking, useStopTimeTracking } from "@/hooks/useTimeTracking"
import { useToast } from "@/hooks/use-toast"

export function Dashboard() {
  const [trackingTime, setTrackingTime] = useState("00:00:00")
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: tasks = [], isLoading: tasksLoading } = useTasks()
  const { data: activeEntry } = useActiveTimeEntry()
  const startTracking = useStartTimeTracking()
  const stopTracking = useStopTimeTracking()
  const { toast } = useToast()

  const isTracking = !!activeEntry

  // Update timer display
  useEffect(() => {
    if (!activeEntry) {
      setTrackingTime("00:00:00")
      return
    }

    const updateTimer = () => {
      const start = new Date(activeEntry.start_time)
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTrackingTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [activeEntry])

  const handleTimeTracking = async () => {
    try {
      if (isTracking && activeEntry) {
        await stopTracking.mutateAsync(activeEntry.id)
        toast({
          title: "Time tracking stopped",
          description: "Your time has been recorded.",
        })
      } else {
        await startTracking.mutateAsync({
          start_time: new Date().toISOString(),
          description: "General work time",
        })
        toast({
          title: "Time tracking started",
          description: "Timer is now running.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Planning": return "bg-yellow-100 text-yellow-800"
      case "Review": return "bg-green-100 text-green-800"
      case "Completed": return "bg-gray-100 text-gray-800"
      case "On Hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500"
      case "medium": return "border-l-yellow-500"
      case "low": return "border-l-green-500"
      default: return "border-l-gray-500"
    }
  }

  const activeProjects = projects.filter(p => p.status !== 'Completed')
  const pendingTasks = tasks.filter(t => t.status !== 'done')
  const teamMembers = new Set(projects.flatMap(p => p.project_members.map(m => m.user_id))).size

  if (projectsLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
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
                onClick={handleTimeTracking}
                disabled={startTracking.isPending || stopTracking.isPending}
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
                <p className="text-2xl font-bold text-gray-900">{activeProjects.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{teamMembers}</p>
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
                <p className="text-2xl font-bold text-gray-900">--</p>
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
            {activeProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active projects yet.</p>
            ) : (
              activeProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">
                        {project.client ? project.client.name : 'Internal'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.due_date || 'No due date'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.project_members.length} members
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending tasks.</p>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)} pl-4 py-2`}>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-500">{task.project?.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
