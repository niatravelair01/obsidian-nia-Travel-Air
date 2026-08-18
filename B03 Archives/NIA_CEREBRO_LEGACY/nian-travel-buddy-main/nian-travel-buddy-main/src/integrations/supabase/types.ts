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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          average_budget: number | null
          budgets_count: number | null
          company_id: string
          created_at: string
          destination: string | null
          destinations_of_interest: string[] | null
          email: string | null
          flight_class_preference: string | null
          hotel_preference: string | null
          id: string
          last_interaction: string | null
          name: string
          notes: string | null
          phone: string | null
          price_sensitivity:
            | Database["public"]["Enums"]["price_sensitivity"]
            | null
          relationship_status: string | null
          status: Database["public"]["Enums"]["client_status"]
          ticket_type: Database["public"]["Enums"]["ticket_type"] | null
          travel_profile: string | null
          updated_at: string
          valor_lifetime: number | null
        }
        Insert: {
          average_budget?: number | null
          budgets_count?: number | null
          company_id: string
          created_at?: string
          destination?: string | null
          destinations_of_interest?: string[] | null
          email?: string | null
          flight_class_preference?: string | null
          hotel_preference?: string | null
          id?: string
          last_interaction?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          price_sensitivity?:
            | Database["public"]["Enums"]["price_sensitivity"]
            | null
          relationship_status?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          travel_profile?: string | null
          updated_at?: string
          valor_lifetime?: number | null
        }
        Update: {
          average_budget?: number | null
          budgets_count?: number | null
          company_id?: string
          created_at?: string
          destination?: string | null
          destinations_of_interest?: string[] | null
          email?: string | null
          flight_class_preference?: string | null
          hotel_preference?: string | null
          id?: string
          last_interaction?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          price_sensitivity?:
            | Database["public"]["Enums"]["price_sensitivity"]
            | null
          relationship_status?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          travel_profile?: string | null
          updated_at?: string
          valor_lifetime?: number | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          caixa_disponivel: number | null
          company_id: string
          created_at: string
          custos_fixos_mensais: number | null
          id: string
          meta_faturamento: number | null
          updated_at: string
        }
        Insert: {
          caixa_disponivel?: number | null
          company_id: string
          created_at?: string
          custos_fixos_mensais?: number | null
          id?: string
          meta_faturamento?: number | null
          updated_at?: string
        }
        Update: {
          caixa_disponivel?: number | null
          company_id?: string
          created_at?: string
          custos_fixos_mensais?: number | null
          id?: string
          meta_faturamento?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string | null
          data_agendada: string | null
          id: string
          status: string | null
          tipo: string
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string | null
          data_agendada?: string | null
          id?: string
          status?: string | null
          tipo: string
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          data_agendada?: string | null
          id?: string
          status?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string | null
          data_prevista: string | null
          id: string
          status: string | null
          tipo: string | null
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string | null
          data_prevista?: string | null
          id?: string
          status?: string | null
          tipo?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          data_prevista?: string | null
          id?: string
          status?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      nia_settings: {
        Row: {
          agency_focus: string | null
          agency_name: string | null
          agency_stage: string | null
          avoid_aggressive_followups: boolean | null
          avoid_discounts: boolean | null
          business_priority: string | null
          client_profile: string | null
          communication_style: string | null
          company_id: string
          created_at: string
          id: string
          prefer_premium: boolean | null
          updated_at: string
          user_gender: string | null
          user_id: string | null
        }
        Insert: {
          agency_focus?: string | null
          agency_name?: string | null
          agency_stage?: string | null
          avoid_aggressive_followups?: boolean | null
          avoid_discounts?: boolean | null
          business_priority?: string | null
          client_profile?: string | null
          communication_style?: string | null
          company_id: string
          created_at?: string
          id?: string
          prefer_premium?: boolean | null
          updated_at?: string
          user_gender?: string | null
          user_id?: string | null
        }
        Update: {
          agency_focus?: string | null
          agency_name?: string | null
          agency_stage?: string | null
          avoid_aggressive_followups?: boolean | null
          avoid_discounts?: boolean | null
          business_priority?: string | null
          client_profile?: string | null
          communication_style?: string | null
          company_id?: string
          created_at?: string
          id?: string
          prefer_premium?: boolean | null
          updated_at?: string
          user_gender?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      orcamento_status_logs: {
        Row: {
          changed_at: string | null
          company_id: string
          id: string
          orcamento_id: string | null
          status_anterior: string | null
          status_novo: string | null
        }
        Insert: {
          changed_at?: string | null
          company_id: string
          id?: string
          orcamento_id?: string | null
          status_anterior?: string | null
          status_novo?: string | null
        }
        Update: {
          changed_at?: string | null
          company_id?: string
          id?: string
          orcamento_id?: string | null
          status_anterior?: string | null
          status_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_status_logs_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          checklist_conferido: boolean | null
          client_id: string | null
          company_id: string
          confirmacao_cliente: boolean | null
          created_at: string | null
          custo_total: number | null
          data_viagem: string | null
          forma_pagamento: string | null
          id: string
          lucro: number | null
          margem_percent: number | null
          motivo_perda: string | null
          pagamento_confirmado: boolean | null
          status: string | null
          titulo: string | null
          valor_total: number | null
        }
        Insert: {
          checklist_conferido?: boolean | null
          client_id?: string | null
          company_id: string
          confirmacao_cliente?: boolean | null
          created_at?: string | null
          custo_total?: number | null
          data_viagem?: string | null
          forma_pagamento?: string | null
          id?: string
          lucro?: number | null
          margem_percent?: number | null
          motivo_perda?: string | null
          pagamento_confirmado?: boolean | null
          status?: string | null
          titulo?: string | null
          valor_total?: number | null
        }
        Update: {
          checklist_conferido?: boolean | null
          client_id?: string | null
          company_id?: string
          confirmacao_cliente?: boolean | null
          created_at?: string | null
          custo_total?: number | null
          data_viagem?: string | null
          forma_pagamento?: string | null
          id?: string
          lucro?: number | null
          margem_percent?: number | null
          motivo_perda?: string | null
          pagamento_confirmado?: boolean | null
          status?: string | null
          titulo?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string | null
          descricao: string | null
          id: string
          status: string | null
          titulo: string
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          titulo: string
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      client_status:
        | "atendimento"
        | "negociacao"
        | "pos-venda"
        | "lead"
        | "inativo"
      price_sensitivity: "low" | "medium" | "high"
      ticket_type: "alto" | "premium" | "medio" | "economico"
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
      client_status: [
        "atendimento",
        "negociacao",
        "pos-venda",
        "lead",
        "inativo",
      ],
      price_sensitivity: ["low", "medium", "high"],
      ticket_type: ["alto", "premium", "medio", "economico"],
    },
  },
} as const
