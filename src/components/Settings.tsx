import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function Settings() {
  const { signOut } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Success",
        description: "You have been signed out",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Settings</h2>
      <p className="text-muted-foreground">Manage your account settings here.</p>
      
      <div className="pt-4">
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  )
} 