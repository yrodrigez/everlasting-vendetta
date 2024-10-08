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
      blizzard_token: {
        Row: {
          created_at: string
          expires_at: string | null
          id: number
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: number
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: number
          token?: string
        }
        Relationships: []
      }
      chat_message_read: {
        Row: {
          created_at: string
          id: string
          message_id: string
          read_at: string | null
          received_at: string
          room_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          read_at?: string | null
          received_at?: string
          room_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string | null
          received_at?: string
          room_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_read_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_read_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_room_members_view"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "chat_message_read_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_room_members_view"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_room_members_view"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
          name: string | null
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_admin: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ev_admin_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_application: {
        Row: {
          class: string
          created_at: string
          email: string | null
          id: number
          message: string | null
          name: string
          role: string
        }
        Insert: {
          class: string
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name: string
          role: string
        }
        Update: {
          class?: string
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string
          role?: string
        }
        Relationships: []
      }
      ev_extra_reservations: {
        Row: {
          character_id: number
          created_at: string
          extra_reservations: number
          given_by: number | null
          id: number
          reset_id: string
          updated_at: string | null
        }
        Insert: {
          character_id: number
          created_at?: string
          extra_reservations?: number
          given_by?: number | null
          id?: number
          reset_id: string
          updated_at?: string | null
        }
        Update: {
          character_id?: number
          created_at?: string
          extra_reservations?: number
          given_by?: number | null
          id?: number
          reset_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_extra_reservation_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ev_extra_reservation_given_by_fkey"
            columns: ["given_by"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ev_extra_reservation_reset_id_fkey"
            columns: ["reset_id"]
            isOneToOne: false
            referencedRelation: "raid_resets"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_guild_roster_history: {
        Row: {
          created_at: string
          details: Json
          id: string
        }
        Insert: {
          created_at?: string
          details: Json
          id?: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
        }
        Relationships: []
      }
      ev_loot_history: {
        Row: {
          character: string | null
          dateTime: string
          id: string
          itemID: number | null
          offspec: number | null
          raid_id: string
        }
        Insert: {
          character?: string | null
          dateTime?: string
          id: string
          itemID?: number | null
          offspec?: number | null
          raid_id: string
        }
        Update: {
          character?: string | null
          dateTime?: string
          id?: string
          itemID?: number | null
          offspec?: number | null
          raid_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ev_loot_history_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "raid_resets"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_member: {
        Row: {
          character: Json | null
          created_at: string
          id: number
          registration_source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          character?: Json | null
          created_at?: string
          id?: number
          registration_source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          character?: Json | null
          created_at?: string
          id?: number
          registration_source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ev_member_role: {
        Row: {
          created_at: string
          id: string
          member_id: number | null
          role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          member_id?: number | null
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: number | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_member_role_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ev_member_role_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "ev_role"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_raid: {
        Row: {
          created_at: string
          id: string
          image: string | null
          min_level: number | null
          name: string
          reservation_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          min_level?: number | null
          name?: string
          reservation_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          min_level?: number | null
          name?: string
          reservation_amount?: number
        }
        Relationships: []
      }
      ev_raid_participant: {
        Row: {
          created_at: string
          details: Json | null
          is_confirmed: boolean
          member_id: number
          raid_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          is_confirmed: boolean
          member_id?: number
          raid_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          is_confirmed?: boolean
          member_id?: number
          raid_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_member_raid_reset_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_member_raid_reset_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "raid_resets"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_role: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      ev_role_permissions: {
        Row: {
          created_at: string
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_role_permissions_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "ev_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ev_role_permissions_role_fkey1"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "ev_role"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      last_raid: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string | null
          image_url: string | null
          max_delay_days: number | null
          min_lvl: number | null
          modified_at: string | null
          name: string | null
          raid_date: string | null
          raid_id: string | null
          reservations_closed: boolean | null
          status: string | null
          time: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          image_url?: string | null
          max_delay_days?: number | null
          min_lvl?: number | null
          modified_at?: string | null
          name?: string | null
          raid_date?: string | null
          raid_id?: string | null
          reservations_closed?: boolean | null
          status?: string | null
          time?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          image_url?: string | null
          max_delay_days?: number | null
          min_lvl?: number | null
          modified_at?: string | null
          name?: string | null
          raid_date?: string | null
          raid_id?: string | null
          reservations_closed?: boolean | null
          status?: string | null
          time?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      log_table: {
        Row: {
          log_time: string | null
          message: string | null
        }
        Insert: {
          log_time?: string | null
          message?: string | null
        }
        Update: {
          log_time?: string | null
          message?: string | null
        }
        Relationships: []
      }
      member_rank: {
        Row: {
          created_at: string
          id: number
          member_id: number | null
          rank_number: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          member_id?: number | null
          rank_number?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          member_id?: number | null
          rank_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "member_rank_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      raid_loot: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean | null
          item_id: number | null
          raid_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          item_id?: number | null
          raid_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          item_id?: number | null
          raid_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raid_loot_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "raid_loot_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raid_loot_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "ev_raid"
            referencedColumns: ["id"]
          },
        ]
      }
      raid_loot_item: {
        Row: {
          created_at: string
          description: Json | null
          id: number
          name: string
          raid_id: string | null
        }
        Insert: {
          created_at?: string
          description?: Json | null
          id?: number
          name: string
          raid_id?: string | null
        }
        Update: {
          created_at?: string
          description?: Json | null
          id?: number
          name?: string
          raid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_raid_loot_item_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "ev_raid"
            referencedColumns: ["id"]
          },
        ]
      }
      raid_loot_reservation: {
        Row: {
          created_at: string
          id: string
          item_id: number
          member_id: number
          modified_at: string | null
          reset_id: string
          status: string | null
          status_color: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: number
          member_id: number
          modified_at?: string | null
          reset_id: string
          status?: string | null
          status_color?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: number
          member_id?: number
          modified_at?: string | null
          reset_id?: string
          status?: string | null
          status_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_raid_loot_reservation_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "raid_loot_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_raid_loot_reservation_reset_id_fkey"
            columns: ["reset_id"]
            isOneToOne: false
            referencedRelation: "raid_resets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raid_loot_reservation_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
        ]
      }
      raid_resets: {
        Row: {
          created_at: string
          created_by: number | null
          days: Json
          end_date: string | null
          end_time: string | null
          id: string
          image_url: string | null
          max_delay_days: number | null
          min_lvl: number | null
          modified_at: string | null
          modified_by: number | null
          name: string | null
          raid_date: string
          raid_id: string | null
          reservations_closed: boolean | null
          status: string | null
          time: string | null
        }
        Insert: {
          created_at?: string
          created_by?: number | null
          days?: Json
          end_date?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          max_delay_days?: number | null
          min_lvl?: number | null
          modified_at?: string | null
          modified_by?: number | null
          name?: string | null
          raid_date: string
          raid_id?: string | null
          reservations_closed?: boolean | null
          status?: string | null
          time?: string | null
        }
        Update: {
          created_at?: string
          created_by?: number | null
          days?: Json
          end_date?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          max_delay_days?: number | null
          min_lvl?: number | null
          modified_at?: string | null
          modified_by?: number | null
          name?: string | null
          raid_date?: string
          raid_id?: string | null
          reservations_closed?: boolean | null
          status?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raid_resets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raid_resets_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raid_resets_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "ev_raid"
            referencedColumns: ["id"]
          },
        ]
      }
      recipients: {
        Row: {
          avatar: string
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          avatar: string
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          avatar?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          last_modified: string | null
          name: string | null
          user_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          last_modified?: string | null
          name?: string | null
          user_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          last_modified?: string | null
          name?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wow_items: {
        Row: {
          created_at: string
          details: Json
          display_id: number | null
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          details: Json
          display_id?: number | null
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json
          display_id?: number | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      chat_room_members_view: {
        Row: {
          member_ids: string[] | null
          room_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_total_reservations: {
        Args: {
          reset_uuid: string
          char_id: number
        }
        Returns: number
      }
      count_reservations:
        | {
            Args: {
              member_id_arg: number
              reset_id_arg: number
            }
            Returns: number
          }
        | {
            Args: {
              member_id_arg: number
              reset_id_arg: string
            }
            Returns: number
          }
      duplicate_molten_core_raid: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      duplicate_raid: {
        Args: {
          p_interval: unknown
          p_raid_id: string
        }
        Returns: undefined
      }
      get_accessible_rooms: {
        Args: {
          user_id: string
        }
        Returns: string[]
      }
      get_guild_roster_history: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_last_raid_date: {
        Args: {
          p_raid_id: string
        }
        Returns: string
      }
      id_text: {
        Args: {
          id_column: string
        }
        Returns: string
      }
      is_user_alloed_to_see_members: {
        Args: {
          tu_puta_madre_id: boolean
        }
        Returns: boolean
      }
      is_user_allowed_to_see_members: {
        Args: {
          tu_puta_madre_id: string
        }
        Returns: boolean
      }
      is_user_owner_of_room: {
        Args: {
          user_id: string
          room_id: string
        }
        Returns: boolean
      }
      reset_id_starts_with: {
        Args: {
          id_prefix: string
        }
        Returns: {
          created_at: string
          created_by: number | null
          days: Json
          end_date: string | null
          end_time: string | null
          id: string
          image_url: string | null
          max_delay_days: number | null
          min_lvl: number | null
          modified_at: string | null
          modified_by: number | null
          name: string | null
          raid_date: string
          raid_id: string | null
          reservations_closed: boolean | null
          status: string | null
          time: string | null
        }[]
      }
      run_weekly_raids: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_select_last_raid: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
