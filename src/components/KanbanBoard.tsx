
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Plus, User } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "inprogress" | "review" | "done"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string
  tags?: string[]
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create initial homepage design concepts",
    status: "todo",
    priority: "high",
    assignee: "Sarah",
    dueDate: "2024-06-10",
    tags: ["design", "ui"]
  },
  {
    id: "2",
    title: "Review brand guidelines",
    description: "Go through client's existing brand materials",
    status: "todo",
    priority: "medium",
    assignee: "John",
    dueDate: "2024-06-08",
    tags: ["research"]
  },
  {
    id: "3",
    title: "Create color palette",
    description: "Develop new brand colors based on requirements",
    status: "inprogress",
    priority: "high",
    assignee: "Sarah",
    dueDate: "2024-06-12",
    tags: ["design", "branding"]
  },
  {
    id: "4",
    title: "Logo variations",
    description: "Create multiple logo concepts and variations",
    status: "review",
    priority: "high",
    assignee: "Mike",
    dueDate: "2024-06-15",
    tags: ["design", "logo"]
  },
  {
    id: "5",
    title: "Client presentation deck",
    description: "Prepare presentation for client review meeting",
    status: "done",
    priority: "medium",
    assignee: "John",
    dueDate: "2024-06-05",
    tags: ["presentation"]
  }
]

const columns = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "inprogress", title: "In Progress", color: "bg-blue-100" },
  { id: "review", title: "Review", color: "bg-yellow-100" },
  { id: "done", title: "Done", color: "bg-green-100" }
]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500 bg-red-50"
      case "medium": return "border-l-yellow-500 bg-yellow-50"
      case "low": return "border-l-green-500 bg-green-50"
      default: return "border-l-gray-500 bg-gray-50"
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Kanban</h1>
          <p className="text-gray-500 mt-1">Brand Redesign - TechCorp Inc.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className={`p-4 rounded-lg ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <Card key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-shadow cursor-pointer`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                      </div>

                      {task.tags && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </div>
                        )}
                        
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {task.assignee.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'high' ? 'border-red-200 text-red-700' :
                            task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-green-200 text-green-700'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 py-8"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
