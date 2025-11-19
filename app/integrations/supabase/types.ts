
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
          menu_group: string | null
          menu_group_en: string | null
          is_premium: boolean
          is_active: boolean
          display_order: number | null
          cta_type: string | null
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
          menu_group?: string | null
          menu_group_en?: string | null
          is_premium?: boolean
          is_active?: boolean
          display_order?: number | null
          cta_type?: string | null
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
          menu_group?: string | null
          menu_group_en?: string | null
          is_premium?: boolean
          is_active?: boolean
          display_order?: number | null
          cta_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ports: {
        Row: {
          id: string
          name: string
          slug: string
          city: string | null
          country: string
          region: Database["public"]["Enums"]["port_region"] | null
          services_available: Database["public"]["Enums"]["port_service"][] | null
          description_fr: string | null
          description_en: string | null
          is_hub: boolean
          has_premium_agent: boolean
          status: Database["public"]["Enums"]["port_status"]
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          city?: string | null
          country: string
          region?: Database["public"]["Enums"]["port_region"] | null
          services_available?: Database["public"]["Enums"]["port_service"][] | null
          description_fr?: string | null
          description_en?: string | null
          is_hub?: boolean
          has_premium_agent?: boolean
          status?: Database["public"]["Enums"]["port_status"]
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          city?: string | null
          country?: string
          region?: Database["public"]["Enums"]["port_region"] | null
          services_available?: Database["public"]["Enums"]["port_service"][] | null
          description_fr?: string | null
          description_en?: string | null
          is_hub?: boolean
          has_premium_agent?: boolean
          status?: Database["public"]["Enums"]["port_status"]
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          user_id: string
          company_name: string
          contact_name: string | null
          phone: string | null
          email: string | null
          country: string | null
          city: string | null
          sector: string | null
          preferred_language: string | null
          is_verified: boolean
          is_super_admin: boolean
          admin_option: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          country?: string | null
          city?: string | null
          sector?: string | null
          preferred_language?: string | null
          is_verified?: boolean
          is_super_admin?: boolean
          admin_option?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          country?: string | null
          city?: string | null
          sector?: string | null
          preferred_language?: string | null
          is_verified?: boolean
          is_super_admin?: boolean
          admin_option?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      translations: {
        Row: {
          id: string
          key: string
          fr: string | null
          en: string | null
          es: string | null
          ar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          fr?: string | null
          en?: string | null
          es?: string | null
          ar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          fr?: string | null
          en?: string | null
          es?: string | null
          ar?: string | null
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
      shipments: {
        Row: {
          id: string
          tracking_number: string
          client: string
          origin_port: string
          destination_port: string
          cargo_type: string | null
          container_type: Database["public"]["Enums"]["container_type"] | null
          incoterm: string | null
          current_status: Database["public"]["Enums"]["shipment_status"]
          eta: string | null
          etd: string | null
          last_update: string | null
          internal_notes: string | null
          client_visible_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracking_number: string
          client: string
          origin_port: string
          destination_port: string
          cargo_type?: string | null
          container_type?: Database["public"]["Enums"]["container_type"] | null
          incoterm?: string | null
          current_status?: Database["public"]["Enums"]["shipment_status"]
          eta?: string | null
          etd?: string | null
          last_update?: string | null
          internal_notes?: string | null
          client_visible_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracking_number?: string
          client?: string
          origin_port?: string
          destination_port?: string
          cargo_type?: string | null
          container_type?: Database["public"]["Enums"]["container_type"] | null
          incoterm?: string | null
          current_status?: Database["public"]["Enums"]["shipment_status"]
          eta?: string | null
          etd?: string | null
          last_update?: string | null
          internal_notes?: string | null
          client_visible_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_client_fkey"
            columns: ["client"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_origin_port_fkey"
            columns: ["origin_port"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_destination_port_fkey"
            columns: ["destination_port"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          client: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date: string
          end_date: string | null
          is_active: boolean
          payment_provider: string | null
          payment_reference: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date: string
          end_date?: string | null
          is_active?: boolean
          payment_provider?: string | null
          payment_reference?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          payment_provider?: string | null
          payment_reference?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_fkey"
            columns: ["client"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      freight_quotes: {
        Row: {
          id: string
          client: string | null
          origin_port: string
          destination_port: string
          cargo_type: string | null
          volume_details: string | null
          incoterm: string | null
          desired_eta: string | null
          status: Database["public"]["Enums"]["freight_quote_status"]
          quoted_price: number | null
          currency: string
          client_email: string | null
          client_name: string | null
          created_at: string
          updated_at: string
          service_id: string | null
          quote_amount: number | null
          quote_currency: string
          payment_status: string
          client_decision: string | null
          can_pay_online: boolean
          ordered_as_shipment: string | null
        }
        Insert: {
          id?: string
          client?: string | null
          origin_port: string
          destination_port: string
          cargo_type?: string | null
          volume_details?: string | null
          incoterm?: string | null
          desired_eta?: string | null
          status?: Database["public"]["Enums"]["freight_quote_status"]
          quoted_price?: number | null
          currency?: string
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          updated_at?: string
          service_id?: string | null
          quote_amount?: number | null
          quote_currency?: string
          payment_status?: string
          client_decision?: string | null
          can_pay_online?: boolean
          ordered_as_shipment?: string | null
        }
        Update: {
          id?: string
          client?: string | null
          origin_port?: string
          destination_port?: string
          cargo_type?: string | null
          volume_details?: string | null
          incoterm?: string | null
          desired_eta?: string | null
          status?: Database["public"]["Enums"]["freight_quote_status"]
          quoted_price?: number | null
          currency?: string
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          updated_at?: string
          service_id?: string | null
          quote_amount?: number | null
          quote_currency?: string
          payment_status?: string
          client_decision?: string | null
          can_pay_online?: boolean
          ordered_as_shipment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freight_quotes_client_fkey"
            columns: ["client"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freight_quotes_origin_port_fkey"
            columns: ["origin_port"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freight_quotes_destination_port_fkey"
            columns: ["destination_port"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freight_quotes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_global"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freight_quotes_ordered_as_shipment_fkey"
            columns: ["ordered_as_shipment"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          }
        ]
      }
      email_notifications: {
        Row: {
          id: string
          recipient_email: string
          email_type: string
          subject: string | null
          body: string | null
          metadata: Json | null
          sent_at: string
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_email: string
          email_type: string
          subject?: string | null
          body?: string | null
          metadata?: Json | null
          sent_at?: string
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_email?: string
          email_type?: string
          subject?: string | null
          body?: string | null
          metadata?: Json | null
          sent_at?: string
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      shipment_documents: {
        Row: {
          id: string
          shipment: string
          file_path: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          type: string
          uploaded_at: string
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shipment: string
          file_path: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          type: string
          uploaded_at?: string
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shipment?: string
          file_path?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          type?: string
          uploaded_at?: string
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_documents_shipment_fkey"
            columns: ["shipment"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events_log: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          client_id: string | null
          service_id: string | null
          quote_id: string | null
          shipment_id: string | null
          port_id: string | null
          details: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          client_id?: string | null
          service_id?: string | null
          quote_id?: string | null
          shipment_id?: string | null
          port_id?: string | null
          details?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          client_id?: string | null
          service_id?: string | null
          quote_id?: string | null
          shipment_id?: string | null
          port_id?: string | null
          details?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_log_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_global"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_log_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "freight_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_log_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_log_port_id_fkey"
            columns: ["port_id"]
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
      port_region: "africa" | "europe" | "asia_me" | "americas" | "oceania"
      port_service: "consignation" | "chartering" | "customs" | "logistics" | "ship_supply" | "crew_support" | "warehousing" | "door_to_door"
      port_status: "active" | "inactive" | "draft"
      agent_activity: "consignation" | "customs" | "freight_forwarding" | "ship_supply" | "warehousing" | "trucking" | "consulting"
      agent_status: "pending" | "validated" | "rejected"
      container_type: "FCL_20DC" | "FCL_40DC" | "FCL_40HC" | "LCL" | "BULK" | "RORO" | "OTHER"
      shipment_status: "draft" | "quote_pending" | "confirmed" | "in_transit" | "at_port" | "delivered" | "on_hold" | "cancelled"
      plan_type: "basic" | "premium_tracking" | "enterprise_logistics" | "agent_listing" | "digital_portal"
      freight_quote_status: "received" | "in_progress" | "sent_to_client" | "accepted" | "refused"
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
        africa: "africa",
        europe: "europe",
        asia_me: "asia_me",
        americas: "americas",
        oceania: "oceania",
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
        active: "active",
        inactive: "inactive",
        draft: "draft",
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
      container_type: {
        FCL_20DC: "FCL_20DC",
        FCL_40DC: "FCL_40DC",
        FCL_40HC: "FCL_40HC",
        LCL: "LCL",
        BULK: "BULK",
        RORO: "RORO",
        OTHER: "OTHER",
      },
      shipment_status: {
        draft: "draft",
        quote_pending: "quote_pending",
        confirmed: "confirmed",
        in_transit: "in_transit",
        at_port: "at_port",
        delivered: "delivered",
        on_hold: "on_hold",
        cancelled: "cancelled",
      },
      plan_type: {
        basic: "basic",
        premium_tracking: "premium_tracking",
        enterprise_logistics: "enterprise_logistics",
        agent_listing: "agent_listing",
        digital_portal: "digital_portal",
      },
      freight_quote_status: {
        received: "received",
        in_progress: "in_progress",
        sent_to_client: "sent_to_client",
        accepted: "accepted",
        refused: "refused",
      },
    },
  },
} as const
