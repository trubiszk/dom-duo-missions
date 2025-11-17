export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      couple_members: {
        Row: {
          couple_space_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          couple_space_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          couple_space_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_spaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          name?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      cycle_tracking: {
        Row: {
          couple_space_id: string
          created_at: string
          cycle_length: number
          enabled: boolean
          id: string
          last_period_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          couple_space_id: string
          created_at?: string
          cycle_length?: number
          enabled?: boolean
          id?: string
          last_period_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          couple_space_id?: string
          created_at?: string
          cycle_length?: number
          enabled?: boolean
          id?: string
          last_period_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_tracking_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["task_category"]
          completed: boolean
          completed_at: string | null
          couple_space_id: string
          created_at: string
          created_by: string
          description: string | null
          exp_reward: number
          id: string
          is_shared: boolean
          streak_count: number
          title: string
          week_end: string
          week_start: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["task_category"]
          completed?: boolean
          completed_at?: string | null
          couple_space_id: string
          created_at?: string
          created_by: string
          description?: string | null
          exp_reward?: number
          id?: string
          is_shared?: boolean
          streak_count?: number
          title: string
          week_end: string
          week_start: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["task_category"]
          completed?: boolean
          completed_at?: string | null
          couple_space_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          exp_reward?: number
          id?: string
          is_shared?: boolean
          streak_count?: number
          title?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          id: string
          redeemed_at: string
          redeemed_by: string
          reward_id: string
        }
        Insert: {
          id?: string
          redeemed_at?: string
          redeemed_by: string
          reward_id: string
        }
        Update: {
          id?: string
          redeemed_at?: string
          redeemed_by?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          cost_points: number
          couple_space_id: string
          created_at: string
          created_by: string
          description: string | null
          for_user: string | null
          id: string
          is_shared: boolean
          title: string
        }
        Insert: {
          cost_points: number
          couple_space_id: string
          created_at?: string
          created_by: string
          description?: string | null
          for_user?: string | null
          id?: string
          is_shared?: boolean
          title: string
        }
        Update: {
          cost_points?: number
          couple_space_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          for_user?: string | null
          id?: string
          is_shared?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["task_category"]
          completed: boolean
          completed_at: string | null
          couple_space_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["task_category"]
          completed?: boolean
          completed_at?: string | null
          couple_space_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["task_category"]
          completed?: boolean
          completed_at?: string | null
          couple_space_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exp: {
        Row: {
          couple_space_id: string
          exp_points: number
          id: string
          user_id: string
        }
        Insert: {
          couple_space_id: string
          exp_points?: number
          id?: string
          user_id: string
        }
        Update: {
          couple_space_id?: string
          exp_points?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exp_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_category: "dom" | "finanse" | "zdrowie" | "relacja" | "inne"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      task_category: ["dom", "finanse", "zdrowie", "relacja", "inne"],
    },
  },
} as const
