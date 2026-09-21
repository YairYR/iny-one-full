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
          link_id: string
          longitude: string | null
          os: string | null
          os_version: string | null
          referer: string | null
          region: string | null
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
          link_id: string
          longitude?: string | null
          os?: string | null
          os_version?: string | null
          referer?: string | null
          region?: string | null
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
          link_id?: string
          longitude?: string | null
          os?: string | null
          os_version?: string | null
          referer?: string | null
          region?: string | null
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
            foreignKeyName: "history_clicks_link_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["link_id"]
          },
        ]
      }
      link_destinations: {
        Row: {
          domain: string | null
          link_id: string
          subdomain: string | null
          validated_at: string | null
          validation_status: string
        }
        Insert: {
          domain?: string | null
          link_id: string
          subdomain?: string | null
          validated_at?: string | null
          validation_status?: string
        }
        Update: {
          domain?: string | null
          link_id?: string
          subdomain?: string | null
          validated_at?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_destinations_link_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "short_links"
            referencedColumns: ["link_id"]
          },
        ]
      }
      link_hosts: {
        Row: {
          created_at: string
          host_id: string
          status: string
          subdomain: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          host_id?: string
          status?: string
          subdomain: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          host_id?: string
          status?: string
          subdomain?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_hosts_team_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
      permissions: {
        Row: {
          description: string | null
          id: string
          key: string
          name: string | null
          scope: Database["public"]["Enums"]["role_scope"]
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          name?: string | null
          scope?: Database["public"]["Enums"]["role_scope"]
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          name?: string | null
          scope?: Database["public"]["Enums"]["role_scope"]
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          key: string
          name: string
          scope: Database["public"]["Enums"]["role_scope"]
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          name: string
          scope?: Database["public"]["Enums"]["role_scope"]
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          name?: string
          scope?: Database["public"]["Enums"]["role_scope"]
        }
        Relationships: []
      }
      service_entitlements: {
        Row: {
          key: string
          service_id: string
          value: Json
        }
        Insert: {
          key: string
          service_id: string
          value: Json
        }
        Update: {
          key?: string
          service_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "service_entitlements_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
          plan_key: string | null
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
          plan_key?: string | null
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
          plan_key?: string | null
          price?: number
          service_gateway?: string | null
          type?: string
        }
        Relationships: []
      }
      short_link_destination_changes: {
        Row: {
          changed_at: string
          changed_by: string
          id: number
          link_id: string
          new_destination: string
          old_destination: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: number
          link_id: string
          new_destination: string
          old_destination: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: number
          link_id?: string
          new_destination?: string
          old_destination?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_link_destination_changes_link_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["link_id"]
          },
        ]
      }
      short_links: {
        Row: {
          clicks: number | null
          created_at: string
          created_by: string | null
          created_by_country_code: string | null
          created_by_ip: unknown
          destination: string
          expires_at: string | null
          expires_in: number | null
          host_id: string | null
          link_id: string
          name: string | null
          slug: string
          status: 'active' | 'disabled'
          team_id: string | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          created_by?: string | null
          created_by_country_code?: string | null
          created_by_ip?: unknown
          destination: string
          expires_at?: string | null
          expires_in?: number | null
          host_id?: string | null
          link_id?: string
          name?: string | null
          slug: string
          status?: 'active' | 'disabled'
          team_id?: string | null
        }
        Update: {
          clicks?: number | null
          created_at?: string
          created_by?: string | null
          created_by_country_code?: string | null
          created_by_ip?: unknown
          destination?: string
          expires_at?: string | null
          expires_in?: number | null
          host_id?: string | null
          link_id?: string
          name?: string | null
          slug?: string
          status?: 'active' | 'disabled'
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "short_links_host_team_fkey"
            columns: ["host_id", "team_id"]
            isOneToOne: false
            referencedRelation: "link_hosts"
            referencedColumns: ["host_id", "team_id"]
          },
          {
            foreignKeyName: "short_links_team_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      short_links_daily_stats: {
        Row: {
          browser_counts: Json
          country_counts: Json
          date: string
          device_type_counts: Json
          link_id: string
          os_counts: Json
          total_clicks: number
          unique_ips: number
          updated_at: string | null
        }
        Insert: {
          browser_counts?: Json
          country_counts?: Json
          date: string
          device_type_counts?: Json
          link_id: string
          os_counts?: Json
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
        }
        Update: {
          browser_counts?: Json
          country_counts?: Json
          date?: string
          device_type_counts?: Json
          link_id?: string
          os_counts?: Json
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "short_links_daily_stats_link_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["link_id"]
          },
        ]
      }
      short_links_monthly_stats: {
        Row: {
          browser_counts: Json
          country_counts: Json
          device_type_counts: Json
          link_id: string
          month: number
          os_counts: Json
          total_clicks: number
          unique_ips: number
          updated_at: string | null
          year: number
        }
        Insert: {
          browser_counts?: Json
          country_counts?: Json
          device_type_counts?: Json
          link_id: string
          month: number
          os_counts?: Json
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          browser_counts?: Json
          country_counts?: Json
          device_type_counts?: Json
          link_id?: string
          month?: number
          os_counts?: Json
          total_clicks?: number
          unique_ips?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "short_links_monthly_stats_link_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["link_id"]
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
          link_id: string
          os_counts: Json
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
          link_id: string
          os_counts?: Json
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
          link_id?: string
          os_counts?: Json
          total_clicks?: number
          unique_ips?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_links_stats_link_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "short_links"
            referencedColumns: ["link_id"]
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
          service_id: string
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
      team_members: {
        Row: {
          created_at: string
          joined_at: string
          role_id: string
          status: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          joined_at?: string
          role_id: string
          status?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          joined_at?: string
          role_id?: string
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_role_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role_id: string
          user_id: string
        }
        Insert: {
          role_id: string
          user_id: string
        }
        Update: {
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profiles: {
        Row: {
          country: string | null
          created_at: string
          default_team_id: string | null
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
          default_team_id?: string | null
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
          default_team_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["app_plan"]
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_profiles_default_team_fkey"
            columns: ["default_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      utms: {
        Row: {
          created_at: string
          link_id: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          link_id: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          link_id?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utms_link_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "short_links"
            referencedColumns: ["link_id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_type: string | null
          external_event_id: string | null
          gateway: string | null
          id: string
          payload: Json | null
          processed_at: string | null
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
          processed_at?: string | null
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
          processed_at?: string | null
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
      authorize: { Args: { requested_permission: string }; Returns: boolean }
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
      create_link: {
        Args: {
          p_created_by?: string
          p_created_by_country_code?: string
          p_created_by_ip?: unknown
          p_destination: string
          p_domain: string
          p_expires_in?: number
          p_host_id: string
          p_name?: string
          p_slug: string
          p_subdomain?: string
          p_team_id: string
          p_utm_campaign?: string
          p_utm_content?: string
          p_utm_id?: string
          p_utm_medium?: string
          p_utm_source?: string
          p_utm_term?: string
        }
        Returns: {
          host_id: string
          link_id: string
          slug: string
        }[]
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      fn_verify_shortlink_expired: { Args: never; Returns: undefined }
      get_access_context: { Args: never; Returns: Json }
      get_dashboard_stats_summary: {
        Args: {
          p_date_grouping?: string
          p_end_date: string
          p_link_ids: string[]
          p_start_date: string
        }
        Returns: Json
      }
      get_link_breakdown: {
        Args: { p_from?: string; p_link_id: string; p_to?: string }
        Returns: Json
      }
      get_page_traffic: {
        Args: { p_link_ids: string[] }
        Returns: {
          count: number
          referer: string
        }[]
      }
    }
    Enums: {
      app_plan: "basic" | "pro" | "free"
      app_role: "user" | "editor" | "manager" | "admin"
      role_scope: "global" | "team"
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
      app_plan: ["basic", "pro", "free"],
      app_role: ["user", "editor", "manager", "admin"],
      role_scope: ["global", "team"],
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

