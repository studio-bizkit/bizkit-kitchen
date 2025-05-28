export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: "Admin" | "Manager" | "Employee" | "Intern"
          department: "designer" | "developer"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "Admin" | "Manager" | "Employee" | "Intern"
          department?: "designer" | "developer"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "Admin" | "Manager" | "Employee" | "Intern"
          department?: "designer" | "developer"
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          type: "Client" | "Internal"
          status: "Planning" | "In Progress" | "Review" | "Completed"
          client_id: string | null
          due_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: "Client" | "Internal"
          status?: "Planning" | "In Progress" | "Review" | "Completed"
          client_id?: string | null
          due_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: "Client" | "Internal"
          status?: "Planning" | "In Progress" | "Review" | "Completed"
          client_id?: string | null
          due_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'member' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          notes: string | null
          website: string | null
          id: string
          name: string
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: "todo" | "inprogress" | "review" | "done"
          priority: "low" | "medium" | "high"
          due_date: string | null
          tags: string[] | null
          project_id: string
          assignee_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: "todo" | "inprogress" | "review" | "done"
          priority?: "low" | "medium" | "high"
          due_date?: string | null
          tags?: string[] | null
          project_id: string
          assignee_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: "todo" | "inprogress" | "review" | "done"
          priority?: "low" | "medium" | "high"
          due_date?: string | null
          tags?: string[] | null
          project_id?: string
          assignee_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          description: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          description: string
          is_active: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
