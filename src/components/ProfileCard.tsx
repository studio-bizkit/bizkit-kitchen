import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, Briefcase } from "lucide-react"

export function ProfileCard() {
  const { data: authData } = useAuth()
  const user = authData?.user

  if (!user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800"
      case "Manager": return "bg-blue-100 text-blue-800"
      case "Intern": return "bg-green-100 text-green-800"
      case "Employee": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDepartmentColor = (department: string) => {
    return department === "designer" ? "bg-pink-100 text-pink-800" : "bg-indigo-100 text-indigo-800"
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <Card className="mt-auto border-t">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <div className="flex gap-2 mt-1">
              <Badge className={getRoleColor(user.role)}>
                {user.role}
              </Badge>
              <Badge className={getDepartmentColor(user.department)}>
                {user.department}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="capitalize">{user.role} {user.department && `- ${user.department}`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 