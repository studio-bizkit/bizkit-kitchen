import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MoreHorizontal, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Tables } from "@/integrations/supabase/types"

interface TaskWithAssignee extends Tables<'tasks'> {
  assignee?: {
    email: string
  } | null
}

interface TaskCardProps {
  task: TaskWithAssignee
  onStatusChange: (taskId: string, newStatus: string) => void
  onEdit: () => void
}

export function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-black text-white dark:bg-white dark:text-black"
      case "medium": return "bg-black/80 text-white dark:bg-white/80 dark:text-black"
      case "low": return "bg-black/60 text-white dark:bg-white/60 dark:text-black"
      default: return "bg-black/40 text-white dark:bg-white/40 dark:text-black"
    }
  }

  const getAssigneeName = () => {
    if (!task.assignee) return 'Unassigned'
    return task.assignee.email || 'Unassigned'
  }

  const getAssigneeInitials = () => {
    if (!task.assignee) return 'U'
    const email = task.assignee.email
    const [username] = email.split('@')
    return username.slice(0, 2).toUpperCase() || 'U'
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing bg-white dark:bg-black border border-black/20 dark:border-white/20"
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-black/80 dark:text-white/80">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <DropdownMenuItem onClick={onEdit} className="text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')} className="text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10">
                Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'inprogress')} className="text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10">
                Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'review')} className="text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10">
                Move to Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')} className="text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10">
                Move to Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-sm text-black/60 dark:text-white/60 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between">
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          {task.due_date && (
            <div className="flex items-center gap-1 text-sm text-black/50 dark:text-white/50">
              <Calendar className="w-4 h-4" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 bg-black/10 dark:bg-white/10">
              <AvatarFallback className="text-black/70 dark:text-white/70">
                {task.assignee.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-black/60 dark:text-white/60">
              {task.assignee.email?.split('@')[0] || 'Unassigned'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
