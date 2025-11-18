
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      services_global: {
        Row: {
          id: string
          slug: string
          category: Database["public"]["Enums"]["service_category"]
          name_fr: string
          name_en: string | null
          short_desc_fr: string
          short_desc_en: string | null
          full_desc_fr: string | null
          full_desc_en: string | null
          is_premium: boolean
          is_active: boolean
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          category: Database["public"]["Enums"]["service_category"]
          name_fr: string
          name_en?: string | null
          short_desc_fr: string
          short_desc_en?: string | null
          full_desc_fr?: string | null
          full_desc_en?: string | null
          is_premium?: boolean
          is_active?: boolean
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          category?: Database["public"]["Enums"]["service_category"]
          name_fr?: string
          name_en?: string | null
          short_desc_fr?: string
          short_desc_en?: string | null
          full_desc_fr?: string | null
          full_desc_en?: string | null
          is_premium?: boolean
          is_active?: boolean
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ports: {
        Row: {
          id: string
          name: string
          city: string | null
          country: string | null
          region: Database["public"]["Enums"]["port_region"] | null
          services_available: Database["public"]["Enums"]["port_service"][] | null
          description_fr: string | null
          description_en: string | null
          is_hub: boolean
          status: Database["public"]["Enums"]["port_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city?: string | null
          country?: string | null
          region?: Database["public"]["Enums"]["port_region"] | null
          services_available?: Database["public"]["Enums"]["port_service"][] | null
          description_fr?: string | null
          description_en?: string | null
          is_hub?: boolean
          status?: Database["public"]["Enums"]["port_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string | null
          country?: string | null
          region?: Database["public"]["Enums"]["port_region"] | null
          services_available?: Database["public"]["Enums"]["port_service"][] | null
          description_fr?: string | null
          description_en?: string | null
          is_hub?: boolean
          status?: Database["public"]["Enums"]["port_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_agents: {
        Row: {
          id: string
          company_name: string
          port: string
          activities: Database["public"]["Enums"]["agent_activity"][]
          years_experience: number | null
          whatsapp: string | null
          email: string | null
          website: string | null
          certifications: string | null
          logo: string | null
          status: Database["public"]["Enums"]["agent_status"]
          is_premium_listing: boolean
          notes_internal: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          port: string
          activities: Database["public"]["Enums"]["agent_activity"][]
          years_experience?: number | null
          whatsapp?: string | null
          email?: string | null
          website?: string | null
          certifications?: string | null
          logo?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          is_premium_listing?: boolean
          notes_internal?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          port?: string
          activities?: Database["public"]["Enums"]["agent_activity"][]
          years_experience?: number | null
          whatsapp?: string | null
          email?: string | null
          website?: string | null
          certifications?: string | null
          logo?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          is_premium_listing?: boolean
          notes_internal?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_agents_port_fkey"
            columns: ["port"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          }
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
      service_category: "maritime_shipping" | "logistics_port_handling" | "trade_consulting" | "digital_services"
      port_region: "Afrique" | "Europe" | "Asie" | "Amériques" | "Océanie" | "Moyen-Orient"
      port_service: "consignation" | "chartering" | "customs" | "logistics" | "ship_supply" | "crew_support" | "warehousing" | "door_to_door"
      port_status: "actif" | "en_preparation" | "futur"
      agent_activity: "consignation" | "customs" | "freight_forwarding" | "ship_supply" | "warehousing" | "trucking" | "consulting"
      agent_status: "pending" | "validated" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      service_category: {
        maritime_shipping: "maritime_shipping",
        logistics_port_handling: "logistics_port_handling",
        trade_consulting: "trade_consulting",
        digital_services: "digital_services",
      },
      port_region: {
        Afrique: "Afrique",
        Europe: "Europe",
        Asie: "Asie",
        Amériques: "Amériques",
        Océanie: "Océanie",
        "Moyen-Orient": "Moyen-Orient",
      },
      port_service: {
        consignation: "consignation",
        chartering: "chartering",
        customs: "customs",
        logistics: "logistics",
        ship_supply: "ship_supply",
        crew_support: "crew_support",
        warehousing: "warehousing",
        door_to_door: "door_to_door",
      },
      port_status: {
        actif: "actif",
        en_preparation: "en_preparation",
        futur: "futur",
      },
      agent_activity: {
        consignation: "consignation",
        customs: "customs",
        freight_forwarding: "freight_forwarding",
        ship_supply: "ship_supply",
        warehousing: "warehousing",
        trucking: "trucking",
        consulting: "consulting",
      },
      agent_status: {
        pending: "pending",
        validated: "validated",
        rejected: "rejected",
      },
    },
  },
} as const
