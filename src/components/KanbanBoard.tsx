import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Plus, User, MoreHorizontal } from "lucide-react"
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/useTasks"
import { useProjects } from "@/hooks/useProjects"
import { CreateTaskDialog } from "./CreateTaskDialog"
import { TaskCard } from "./TaskCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import { Tables } from "@/integrations/supabase/types"

const columns = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "inprogress", title: "In Progress", color: "bg-blue-100" },
  { id: "review", title: "Review", color: "bg-yellow-100" },
  { id: "done", title: "Done", color: "bg-green-100" }
]

export function KanbanBoard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Tables<'tasks'> | null>(null)
  const [activeTask, setActiveTask] = useState<Tables<'tasks'> | null>(null)
  const { data: projects = [] } = useProjects()
  const { data: tasks = [], isLoading } = useTasks(selectedProjectId)
  const updateTaskMutation = useUpdateTask()

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        updates: { status: newStatus as 'todo' | 'inprogress' | 'review' | 'done' }
      })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (over && active.id !== over.id) {
      const task = tasks.find(t => t.id === active.id)
      if (task) {
        handleStatusChange(task.id, over.id as string)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Project Kanban</h1>
        </div>
        <div className="text-center py-8">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Kanban</h1>
          {selectedProject && (
            <p className="text-gray-500 mt-1">{selectedProject.name}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} - {project.client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            disabled={!selectedProjectId}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Select a project to view its kanban board</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
                  <SortableContext
                    items={getTasksByStatus(column.id).map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getTasksByStatus(column.id).map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={() => setEditingTask(task)}
                      />
                    ))}
                  </SortableContext>
                  <Button 
                    variant="ghost" 
                    className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 py-8"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {typeof window !== 'undefined' && createPortal(
            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  onStatusChange={handleStatusChange}
                  onEdit={() => setEditingTask(activeTask)}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      )}

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={selectedProjectId}
      />

      {editingTask && (
        <CreateTaskDialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          projectId={selectedProjectId}
          task={editingTask}
        />
      )}
    </div>
  )
}
