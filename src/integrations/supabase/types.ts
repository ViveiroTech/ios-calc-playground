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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          description: string | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          description?: string | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          description?: string | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      bird_types: {
        Row: {
          active: boolean
          created_at: string
          default_candling_day: number
          default_incubation_days: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_candling_day?: number
          default_incubation_days?: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_candling_day?: number
          default_incubation_days?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      candling_photos: {
        Row: {
          candling_record_id: string | null
          created_at: string
          hatching_record_id: string | null
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          candling_record_id?: string | null
          created_at?: string
          hatching_record_id?: string | null
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          candling_record_id?: string | null
          created_at?: string
          hatching_record_id?: string | null
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candling_photos_candling_record_id_fkey"
            columns: ["candling_record_id"]
            isOneToOne: false
            referencedRelation: "candling_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candling_photos_hatching_record_id_fkey"
            columns: ["hatching_record_id"]
            isOneToOne: false
            referencedRelation: "hatching_records"
            referencedColumns: ["id"]
          },
        ]
      }
      candling_records: {
        Row: {
          created_at: string
          cycle_id: string
          date: string
          developing_eggs: number
          discarded_eggs: number
          eggs_examined: number
          fertile_eggs: number
          id: string
          incubation_day: number
          infertile_eggs: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          date?: string
          developing_eggs?: number
          discarded_eggs?: number
          eggs_examined?: number
          fertile_eggs?: number
          id?: string
          incubation_day?: number
          infertile_eggs?: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          date?: string
          developing_eggs?: number
          discarded_eggs?: number
          eggs_examined?: number
          fertile_eggs?: number
          id?: string
          incubation_day?: number
          infertile_eggs?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candling_records_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "incubation_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      hatching_records: {
        Row: {
          chicks_hatched: number
          created_at: string
          cycle_id: string
          date: string
          deaths: number
          eggs_set: number
          fertile_eggs: number
          final_stage_eggs: number
          id: string
          notes: string | null
          unhatched_eggs: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chicks_hatched?: number
          created_at?: string
          cycle_id: string
          date?: string
          deaths?: number
          eggs_set?: number
          fertile_eggs?: number
          final_stage_eggs?: number
          id?: string
          notes?: string | null
          unhatched_eggs?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chicks_hatched?: number
          created_at?: string
          cycle_id?: string
          date?: string
          deaths?: number
          eggs_set?: number
          fertile_eggs?: number
          final_stage_eggs?: number
          id?: string
          notes?: string | null
          unhatched_eggs?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hatching_records_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "incubation_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      incubation_cycles: {
        Row: {
          batch_code: string | null
          bird_type: string | null
          bird_type_id: string | null
          candling_day: number
          completed_at: string | null
          created_at: string
          egg_origin: string | null
          egg_quantity: number
          expected_duration_days: number
          expected_hatch_date: string | null
          id: string
          incubator_id: string
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["cycle_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_code?: string | null
          bird_type?: string | null
          bird_type_id?: string | null
          candling_day?: number
          completed_at?: string | null
          created_at?: string
          egg_origin?: string | null
          egg_quantity: number
          expected_duration_days?: number
          expected_hatch_date?: string | null
          id?: string
          incubator_id: string
          notes?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["cycle_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_code?: string | null
          bird_type?: string | null
          bird_type_id?: string | null
          candling_day?: number
          completed_at?: string | null
          created_at?: string
          egg_origin?: string | null
          egg_quantity?: number
          expected_duration_days?: number
          expected_hatch_date?: string | null
          id?: string
          incubator_id?: string
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["cycle_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incubation_cycles_bird_type_id_fkey"
            columns: ["bird_type_id"]
            isOneToOne: false
            referencedRelation: "bird_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incubation_cycles_incubator_id_fkey"
            columns: ["incubator_id"]
            isOneToOne: false
            referencedRelation: "incubators"
            referencedColumns: ["id"]
          },
        ]
      }
      incubators: {
        Row: {
          acquisition_date: string | null
          brand: string | null
          capacity: number
          code: string | null
          created_at: string
          id: string
          ideal_humidity: number | null
          ideal_temperature: number | null
          location: string | null
          model: string | null
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["incubator_status"]
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acquisition_date?: string | null
          brand?: string | null
          capacity: number
          code?: string | null
          created_at?: string
          id?: string
          ideal_humidity?: number | null
          ideal_temperature?: number | null
          location?: string | null
          model?: string | null
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["incubator_status"]
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acquisition_date?: string | null
          brand?: string | null
          capacity?: number
          code?: string | null
          created_at?: string
          id?: string
          ideal_humidity?: number | null
          ideal_temperature?: number | null
          location?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["incubator_status"]
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          incubator_id: string
          maintenance_type: string
          next_maintenance_date: string | null
          notes: string | null
          responsible: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          incubator_id: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          notes?: string | null
          responsible?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          incubator_id?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          notes?: string | null
          responsible?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_incubator_id_fkey"
            columns: ["incubator_id"]
            isOneToOne: false
            referencedRelation: "incubators"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          event_date: string | null
          id: string
          message: string | null
          read: boolean
          related_cycle_id: string | null
          related_incubator_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date?: string | null
          id?: string
          message?: string | null
          read?: boolean
          related_cycle_id?: string | null
          related_incubator_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string | null
          id?: string
          message?: string | null
          read?: boolean
          related_cycle_id?: string | null
          related_incubator_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_cycle_id_fkey"
            columns: ["related_cycle_id"]
            isOneToOne: false
            referencedRelation: "incubation_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_incubator_id_fkey"
            columns: ["related_incubator_id"]
            isOneToOne: false
            referencedRelation: "incubators"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          duration_days: number
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_days: number
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancellation_date: string | null
          created_at: string
          expires_at: string | null
          external_customer_id: string | null
          external_payment_id: string | null
          external_subscription_id: string | null
          id: string
          last_payment_at: string | null
          next_payment_at: string | null
          payment_provider: string | null
          plan_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancellation_date?: string | null
          created_at?: string
          expires_at?: string | null
          external_customer_id?: string | null
          external_payment_id?: string | null
          external_subscription_id?: string | null
          id?: string
          last_payment_at?: string | null
          next_payment_at?: string | null
          payment_provider?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancellation_date?: string | null
          created_at?: string
          expires_at?: string | null
          external_customer_id?: string | null
          external_payment_id?: string | null
          external_subscription_id?: string | null
          id?: string
          last_payment_at?: string | null
          next_payment_at?: string | null
          payment_provider?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_activate_subscription: {
        Args: { _plan_id?: string; _target_user: string }
        Returns: {
          cancellation_date: string | null
          created_at: string
          expires_at: string | null
          external_customer_id: string | null
          external_payment_id: string | null
          external_subscription_id: string | null
          id: string
          last_payment_at: string | null
          next_payment_at: string | null
          payment_provider: string | null
          plan_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_change_plan: {
        Args: { _plan_id: string; _target_user: string }
        Returns: undefined
      }
      admin_customers: {
        Args: never
        Returns: {
          account_status: Database["public"]["Enums"]["account_status"]
          candlings_count: number
          chicks_total: number
          created_at: string
          cycles_count: number
          days_left: number
          eggs_total: number
          email: string
          expires_at: string
          full_name: string
          incubators_count: number
          phone: string
          plan_name: string
          started_at: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }[]
      }
      admin_log: {
        Args: { _action: string; _description: string; _target: string }
        Returns: undefined
      }
      admin_renew_subscription: {
        Args: { _plan_id?: string; _target_user: string }
        Returns: {
          cancellation_date: string | null
          created_at: string
          expires_at: string | null
          external_customer_id: string | null
          external_payment_id: string | null
          external_subscription_id: string | null
          id: string
          last_payment_at: string | null
          next_payment_at: string | null
          payment_provider: string | null
          plan_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_account_status: {
        Args: {
          _status: Database["public"]["Enums"]["account_status"]
          _target_user: string
        }
        Returns: undefined
      }
      admin_set_subscription_status: {
        Args: {
          _status: Database["public"]["Enums"]["subscription_status"]
          _target_user: string
        }
        Returns: undefined
      }
      bootstrap_account: {
        Args: { _full_name?: string; _phone?: string }
        Returns: undefined
      }
      can_write: { Args: never; Returns: boolean }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      my_access_state: { Args: never; Returns: Json }
    }
    Enums: {
      account_status: "active" | "pending" | "blocked" | "suspended"
      app_role: "platform_admin" | "customer"
      cycle_status:
        | "planned"
        | "incubating"
        | "candling"
        | "hatching"
        | "completed"
        | "canceled"
      incubator_status: "available" | "in_use" | "maintenance" | "inactive"
      subscription_status:
        | "pending"
        | "active"
        | "expired"
        | "canceled"
        | "suspended"
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
      account_status: ["active", "pending", "blocked", "suspended"],
      app_role: ["platform_admin", "customer"],
      cycle_status: [
        "planned",
        "incubating",
        "candling",
        "hatching",
        "completed",
        "canceled",
      ],
      incubator_status: ["available", "in_use", "maintenance", "inactive"],
      subscription_status: [
        "pending",
        "active",
        "expired",
        "canceled",
        "suspended",
      ],
    },
  },
} as const
