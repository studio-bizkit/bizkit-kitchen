import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Mail, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, UserRole, UserDepartment } from "@/hooks/useUsers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth, useIsAdminOrManager, useCanManageUser } from "@/hooks/useAuth"
import { Tables } from "@/integrations/supabase/types"
import { useToast } from "@/components/ui/use-toast"

type User = Tables<'profiles'>

export function Users() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all")
  const [filterDepartment, setFilterDepartment] = useState<UserDepartment | "all">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data: authData } = useAuth()
  const { data: users = [], isLoading, error } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const { toast } = useToast()

  const isAdminOrManager = useIsAdminOrManager()

  const canManageUser = (targetRole: UserRole) => {
    const userRole = authData?.user?.role
    if (!userRole) return false
    if (userRole === 'Admin') return true
    if (userRole === 'Manager') return targetRole !== 'Admin' && targetRole !== 'Manager'
    return false
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesDepartment = filterDepartment === "all" || user.department === filterDepartment

    return matchesSearch && matchesRole && matchesDepartment
  })

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800"
      case "Manager": return "bg-blue-100 text-blue-800"
      case "Intern": return "bg-green-100 text-green-800"
      case "Employee": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDepartmentColor = (department: UserDepartment) => {
    return department === "designer" ? "bg-pink-100 text-pink-800" : "bg-indigo-100 text-indigo-800"
  }

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const role = formData.get("role") as UserRole
    const department = formData.get("department") as UserDepartment

    try {
      await createUserMutation.mutateAsync({ email, role, department })
      toast({
        title: "Success",
        description: "User invited successfully."
      })
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Failed to create user:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user"
      })
    }
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    const formData = new FormData(e.currentTarget)
    const role = formData.get("role") as UserRole
    const department = formData.get("department") as UserDepartment

    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        updates: { role, department }
      })
      toast({
        title: "Success",
        description: "User updated successfully."
      })
      setEditingUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user"
      })
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUserMutation.mutateAsync(id)
        toast({
          title: "Success",
          description: "User has been deleted successfully."
        })
      } catch (error) {
        console.error('Failed to delete user:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete user"
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="text-center py-8">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Alert variant="destructive">
          <AlertDescription>Failed to load users. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage team members and their roles</p>
        </div>
        {isAdminOrManager && (
          <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={(value) => setFilterRole(value as UserRole | "all")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Intern">Intern</SelectItem>
            <SelectItem value="Employee">Employee</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={(value) => setFilterDepartment(value as UserDepartment | "all")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{user.email}</CardTitle>
                  <CardDescription>Member since {new Date(user.created_at).toLocaleDateString()}</CardDescription>
                </div>
                {canManageUser(user.role) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingUser(user)}>Edit User</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
                <Badge className={getDepartmentColor(user.department)}>
                  {user.department}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No users found</div>
          <p className="text-gray-500">Try adjusting your filters or invite new users</p>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>Send an invitation to join the team.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="employee">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {authData?.user?.role === 'Admin' && <SelectItem value="Admin">Admin</SelectItem>}
                    {authData?.user?.role === 'Admin' && <SelectItem value="Manager">Manager</SelectItem>}
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select name="department" defaultValue="developer">
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user role and department.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={editingUser?.role}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {authData?.user?.role === 'Admin' && <SelectItem value="Admin">Admin</SelectItem>}
                    {authData?.user?.role === 'Admin' && <SelectItem value="Manager">Manager</SelectItem>}
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select name="department" defaultValue={editingUser?.department}>
                  <SelectTrigger id="edit-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Update User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 