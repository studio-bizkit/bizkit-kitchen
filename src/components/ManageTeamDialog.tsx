import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/hooks/useUsers"
import { useProjectMembers } from "@/hooks/useProjectMembers"
import { Tables } from "@/integrations/supabase/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X } from "lucide-react"

type Project = Tables<'projects'> & {
  client: Tables<'clients'> | null
  project_members: (Tables<'project_members'> & {
    profiles: Tables<'profiles'> | null
  })[]
}

type ProjectRole = "member" | "admin"

interface ManageTeamDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageTeamDialog({ project, open, onOpenChange }: ManageTeamDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [role, setRole] = useState<ProjectRole>("member")

  const { data: users = [] } = useUsers()
  const { data: projectMembers = [], isLoading } = useProjectMembers(project.id)
  const { addMember, removeMember } = useProjectMembers(project.id)

  const availableUsers = users.filter(
    user => !projectMembers.some(member => member.user_id === user.id)
  )

  const handleAddMember = async () => {
    if (!selectedUserId) return

    try {
      await addMember.mutateAsync({
        project_id: project.id,
        user_id: selectedUserId,
        role
      })
      setSelectedUserId("")
      setRole("member")
    } catch (error) {
      console.error('Failed to add team member:', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync(userId)
    } catch (error) {
      console.error('Failed to remove team member:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Team</DialogTitle>
          <DialogDescription>Add or remove team members from {project.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new member */}
          <div className="space-y-4">
            <h3 className="font-medium">Add Team Member</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: ProjectRole) => setRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleAddMember}
              disabled={!selectedUserId || addMember.isPending}
              className="w-full"
            >
              {addMember.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </div>

          {/* Current members */}
          <div className="space-y-4">
            <h3 className="font-medium">Current Team Members</h3>
            <div className="space-y-2">
              {projectMembers.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.profiles?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.profiles?.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.user_id)}
                    disabled={removeMember.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 