export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      discounts: {
        Row: {
          active: boolean | null
          amount: number
          applies_to: string | null
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          discount_type: string
          id: string
          service_id: string | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          amount: number
          applies_to?: string | null
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_type: string
          id?: string
          service_id?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          amount?: number
          applies_to?: string | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_type?: string
          id?: string
          service_id?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      domains_to_check: {
        Row: {
          domain: string | null
          id: number
          validated: boolean
        }
        Insert: {
          domain?: string | null
          id?: number
          validated?: boolean
        }
        Update: {
          domain?: string | null
          id?: number
          validated?: boolean
        }
        Relationships: []
      }
      history_clicks: {
        Row: {
          browser: string | null
          browser_version: string | null
          city: string | null
          country_code: string | null
          created_at: string
          device_model: string | null
          device_type: string | null
          device_vendor: string | null
          domain: string | null
          id: number
          ip: string | null
          is_bot: boolean
          latitude: string | null
          longitude: string | null
          os: string | null
          os_version: string | null
          referer: string | null
          region: string | null
          slug: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          device_model?: string | null
          device_type?: string | null
          device_vendor?: string | null
          domain?: string | null
          id?: number
          ip?: string | null
          is_bot?: boolean
          latitude?: string | null
          longitude?: string | null
          os?: string | null
          os_version?: string | null
          referer?: string | null
          region?: string | null
          slug: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          device_model?: string | null
          device_type?: string | null
          device_vendor?: string | null
          domain?: string | null
          id?: number
          ip?: string | null
          is_bot?: boolean
          latitude?: string | null
          longitude?: string | null
          os?: string | null
          os_version?: string | null
          referer?: string | null
          region?: string | null
          slug?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "history_clicks_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["slug"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          discount_amount: number | null
          discount_id: string | null
          external_order_id: string | null
          id: string
          payment_gateway: string | null
          service_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_id?: string | null
          external_order_id?: string | null
          id?: string
          payment_gateway?: string | null
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_id?: string | null
          external_order_id?: string | null
          id?: string
          payment_gateway?: string | null
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          external_payment_id: string | null
          gateway: string | null
          id: string
          order_id: string | null
          payer_email: string | null
          payer_id: string | null
          raw_response: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          external_payment_id?: string | null
          gateway?: string | null
          id?: string
          order_id?: string | null
          payer_email?: string | null
          payer_id?: string | null
          raw_response?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          external_payment_id?: string | null
          gateway?: string | null
          id?: string
          order_id?: string | null
          payer_email?: string | null
          payer_id?: string | null
          raw_response?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_permission: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          plan: Database["public"]["Enums"]["app_plan"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          plan: Database["public"]["Enums"]["app_plan"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          plan?: Database["public"]["Enums"]["app_plan"]
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string | null
          currency: string | null
          description: string | null
          external_service_id: string | null
          id: string
          interval: string | null
          name: string
          price: number
          service_gateway: string | null
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_service_id?: string | null
          id?: string
          interval?: string | null
          name: string
          price: number
          service_gateway?: string | null
          type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_service_id?: string | null
          id?: string
          interval?: string | null
          name?: string
          price?: number
          service_gateway?: string | null
          type?: string
        }
        Relationships: []
      }
      short_links: {
        Row: {
          alias: string | null
          clicks: number | null
          country_code_user: string | null
          created_at: string
          destination: string | null
          domain: string | null
          expires_at: string | null
          expires_in: number | null
          ip_user: string | null
          slug: string
          status: boolean
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          alias?: string | null
          clicks?: number | null
          country_code_user?: string | null
          created_at?: string
          destination?: string | null
          domain?: string | null
          expires_at?: string | null
          expires_in?: number | null
          ip_user?: string | null
          slug: string
          status?: boolean
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          alias?: string | null
          clicks?: number | null
          country_code_user?: string | null
          created_at?: string
          destination?: string | null
          domain?: string | null
          expires_at?: string | null
          expires_in?: number | null
          ip_user?: string | null
          slug?: string
          status?: boolean
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      short_links_daily_stats: {
        Row: {
          browser_counts: Json
          country_counts: Json
          date: string
          device_type_counts: Json
          os_counts: Json
          slug: string
          total_clicks: number
          unique_ips: number
          updated_at: string | null
        }
        Insert: {
          browser_counts?: Json
          country_counts?: Json
          date: string
          device_type_counts?: Json
          os_counts?: Json
          slug: string
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
        }
        Update: {
          browser_counts?: Json
          country_counts?: Json
          date?: string
          device_type_counts?: Json
          os_counts?: Json
          slug?: string
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "short_links_daily_stats_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["slug"]
          },
        ]
      }
      short_links_monthly_stats: {
        Row: {
          browser_counts: Json
          country_counts: Json
          device_type_counts: Json
          month: number
          os_counts: Json
          slug: string
          total_clicks: number
          unique_ips: number
          updated_at: string | null
          year: number
        }
        Insert: {
          browser_counts?: Json
          country_counts?: Json
          device_type_counts?: Json
          month: number
          os_counts?: Json
          slug: string
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          browser_counts?: Json
          country_counts?: Json
          device_type_counts?: Json
          month?: number
          os_counts?: Json
          slug?: string
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "short_links_monthly_stats_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["slug"]
          },
        ]
      }
      short_links_stats: {
        Row: {
          browser_counts: Json
          country_counts: Json
          created_at: string
          device_type_counts: Json
          last_click_at: string | null
          os_counts: Json
          slug: string
          total_clicks: number
          unique_ips: number
          updated_at: string
        }
        Insert: {
          browser_counts?: Json
          country_counts?: Json
          created_at?: string
          device_type_counts?: Json
          last_click_at?: string | null
          os_counts?: Json
          slug: string
          total_clicks?: number
          unique_ips?: number
          updated_at?: string
        }
        Update: {
          browser_counts?: Json
          country_counts?: Json
          created_at?: string
          device_type_counts?: Json
          last_click_at?: string | null
          os_counts?: Json
          slug?: string
          total_clicks?: number
          unique_ips?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_links_stats_slug_fkey"
            columns: ["slug"]
            isOneToOne: true
            referencedRelation: "short_links"
            referencedColumns: ["slug"]
          },
        ]
      }
      subscription_requests: {
        Row: {
          created_at: string
          external_subscription_id: string | null
          id: string
          metadata: Json | null
          request_type: string
          service_id: string
          status: string
          subscription_gateway: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          external_subscription_id?: string | null
          id?: string
          metadata?: Json | null
          request_type: string
          service_id: string
          status: string
          subscription_gateway?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          external_subscription_id?: string | null
          id?: string
          metadata?: Json | null
          request_type?: string
          service_id?: string
          status?: string
          subscription_gateway?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_requests_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_reason: string | null
          created_at: string | null
          end_date: string | null
          external_subscription_id: string | null
          id: string
          next_billing_date: string | null
          service_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          subscription_gateway: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_reason?: string | null
          created_at?: string | null
          end_date?: string | null
          external_subscription_id?: string | null
          id?: string
          next_billing_date?: string | null
          service_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          subscription_gateway?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_reason?: string | null
          created_at?: string | null
          end_date?: string | null
          external_subscription_id?: string | null
          id?: string
          next_billing_date?: string | null
          service_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          subscription_gateway?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users_profiles: {
        Row: {
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          plan: Database["public"]["Enums"]["app_plan"]
          timezone: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["app_plan"]
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["app_plan"]
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_type: string | null
          external_event_id: string | null
          gateway: string | null
          id: string
          payload: Json | null
          processed: boolean | null
          resource_type: string | null
          summary: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          external_event_id?: string | null
          gateway?: string | null
          id?: string
          payload?: Json | null
          processed?: boolean | null
          resource_type?: string | null
          summary?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          external_event_id?: string | null
          gateway?: string | null
          id?: string
          payload?: Json | null
          processed?: boolean | null
          resource_type?: string | null
          summary?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      click_short_link: {
        Args: {
          page_slug: string
          user_browser: string | null
          user_browser_version: string | null
          user_city: string | null
          user_country_code: string | null
          user_device_model: string | null
          user_device_type: string | null
          user_device_vendor: string | null
          user_ip: string | null
          user_is_bot: boolean
          user_latitude: string | null
          user_longitude: string | null
          user_os: string | null
          user_os_version: string | null
          user_referer: string | null
          user_region: string | null
          user_ua: string | null
        }
        Returns: undefined
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      fn_verify_shortlink_expired: { Args: never; Returns: undefined }
      get_dashboard_stats_summary: {
        Args: {
          _date_grouping?: string
          _end_date: string
          _slugs: string[]
          _start_date: string
        }
        Returns: {
          summary: {
            clicks: number;
            clicks_last_24h: number;
            date_start: string;
            date_end: string;
            date_grouping: string;
            stats: { date: string, clicks: number }[];
          };
          all_time: {
            clicks: number;
            top_browsers: { name: string, value: number }[];
            top_countries: { name: string, value: number }[];
          }
        }
      }
      get_page_clicks_between_dates: {
        Args: { _end_date: string; _slug: string[]; _start_date: string }
        Returns: number
      }
      get_page_traffic: {
        Args: { _slug: string[] }
        Returns: {
          count: number
          referer: string
        }[]
      }
    }
    Enums: {
      app_permission:
        | "links.create"
        | "links.read"
        | "links.update"
        | "links.delete"
        | "links.transfer"
        | "stats.view"
        | "stats.export"
        | "stats.view_sensitive"
        | "domains.add"
        | "domains.delete"
        | "domains.verify"
        | "domains.read"
        | "team.read"
        | "team.invite"
        | "team.remove"
        | "team.manage_roles"
        | "admin.read"
        | "admin.manage_users"
        | "admin.manage_permissions"
        | "admin.manage_plans"
        | "admin.manage_billing"
        | "admin.access_audit_log"
        | "security.blacklist_domains"
        | "security.whitelist_domains"
        | "security.view_protected"
        | "security.change_ratelimits"
        | "system.view_health"
        | "system.restart_workers"
        | "system.manage_keys"
      app_plan: "basic" | "pro" | "free"
      app_role: "user" | "editor" | "manager" | "admin"
      subscription_status:
        | "INSERTED"
        | "APPROVAL_PENDING"
        | "APPROVED"
        | "ACTIVE"
        | "SUSPENDED"
        | "CANCELLED"
        | "EXPIRED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  security: {
    Tables: {
      blocked_url: {
        Row: {
          created_at: string
          domain: string
          is_custom: boolean
        }
        Insert: {
          created_at?: string
          domain: string
          is_custom?: boolean
        }
        Update: {
          created_at?: string
          domain?: string
          is_custom?: boolean
        }
        Relationships: []
      }
      blocklist_url_phishing_active: {
        Row: {
          domain: string
          id: number
        }
        Insert: {
          domain: string
          id?: number
        }
        Update: {
          domain?: string
          id?: number
        }
        Relationships: []
      }
      cached_blocked_url: {
        Row: {
          created_at: string
          domain: string
          is_custom: boolean
          is_permanent: boolean
        }
        Insert: {
          created_at?: string
          domain: string
          is_custom?: boolean
          is_permanent?: boolean
        }
        Update: {
          created_at?: string
          domain?: string
          is_custom?: boolean
          is_permanent?: boolean
        }
        Relationships: []
      }
      whitelist_url: {
        Row: {
          created_at: string
          domain: string
          is_custom: boolean
        }
        Insert: {
          created_at?: string
          domain: string
          is_custom?: boolean
        }
        Update: {
          created_at?: string
          domain?: string
          is_custom?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_blocked_url: { Args: { domains: string[] }; Returns: number }
      is_domain_secure: { Args: { domain_to_check: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_permission: [
        "links.create",
        "links.read",
        "links.update",
        "links.delete",
        "links.transfer",
        "stats.view",
        "stats.export",
        "stats.view_sensitive",
        "domains.add",
        "domains.delete",
        "domains.verify",
        "domains.read",
        "team.read",
        "team.invite",
        "team.remove",
        "team.manage_roles",
        "admin.read",
        "admin.manage_users",
        "admin.manage_permissions",
        "admin.manage_plans",
        "admin.manage_billing",
        "admin.access_audit_log",
        "security.blacklist_domains",
        "security.whitelist_domains",
        "security.view_protected",
        "security.change_ratelimits",
        "system.view_health",
        "system.restart_workers",
        "system.manage_keys",
      ],
      app_plan: ["basic", "pro", "free"],
      app_role: ["user", "editor", "manager", "admin"],
      subscription_status: [
        "INSERTED",
        "APPROVAL_PENDING",
        "APPROVED",
        "ACTIVE",
        "SUSPENDED",
        "CANCELLED",
        "EXPIRED",
      ],
    },
  },
  security: {
    Enums: {},
  },
} as const

