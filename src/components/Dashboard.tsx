import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, Play, Pause } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useTasks } from "@/hooks/useTasks"
import { useTimeTracking } from "@/hooks/useTimeTracking"
import { useToast } from "@/components/ui/use-toast"
import { Tables } from "@/integrations/supabase/types"

type Task = Tables<'tasks'> & {
  assignee: Tables<'profiles'> | null
  project: Tables<'projects'> | null
}

export function Dashboard() {
  const [trackingTime, setTrackingTime] = useState("00:00:00")
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: tasks = [], isLoading: tasksLoading } = useTasks()
  const { toast } = useToast()
  const { activeEntry, isTracking, startTracking, stopTracking } = useTimeTracking()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && activeEntry) {
      const startTime = new Date(activeEntry.start_time).getTime()
      interval = setInterval(() => {
        const now = new Date().getTime()
        const diff = now - startTime
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTrackingTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, activeEntry])

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
          is_active: true,
        })
        toast({
          title: "Time tracking started",
          description: "Timer is now running.",
        })
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Time Tracking Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Time Tracking</h2>
              <p className="text-gray-500">Track your work hours</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-mono">{trackingTime}</div>
              <Button
                size="lg"
                onClick={handleTimeTracking}
                className={isTracking ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <h3 className="text-2xl font-bold mt-1">{activeProjects.length}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <h3 className="text-2xl font-bold mt-1">{pendingTasks.length}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <h3 className="text-2xl font-bold mt-1">{teamMembers}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your most recent tasks and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${getPriorityColor(task.priority)}`}
              >
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-500">{task.project?.name}</p>
                </div>
                <Badge variant="secondary" className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
