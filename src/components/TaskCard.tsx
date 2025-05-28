
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  tags: string[] | null
  assignee: {
    first_name: string | null
    last_name: string | null
  } | null
}

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, newStatus: string) => void
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500 bg-red-50"
      case "medium": return "border-l-yellow-500 bg-yellow-50"
      case "low": return "border-l-green-500 bg-green-50"
      default: return "border-l-gray-500 bg-gray-50"
    }
  }

  const getAssigneeName = () => {
    if (!task.assignee) return null
    const { first_name, last_name } = task.assignee
    return `${first_name || ''} ${last_name || ''}`.trim() || 'Unassigned'
  }

  const getAssigneeInitials = () => {
    if (!task.assignee) return 'U'
    const { first_name, last_name } = task.assignee
    return `${first_name?.[0] || ''}${last_name?.[0] || ''}` || 'U'
  }

  return (
    <Card className={`border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-shadow cursor-pointer`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
                  Move to To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'inprogress')}>
                  Move to In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'review')}>
                  Move to Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>
                  Move to Done
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
            
            {task.assignee && (
              <div className="flex items-center gap-1">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {getAssigneeInitials()}
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
  )
}
