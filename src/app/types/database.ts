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
      achievements: {
        Row: {
          category: string | null
          condition: Json
          created_at: string
          description: string
          id: string
          img: string | null
          name: string
          points: number
        }
        Insert: {
          category?: string | null
          condition: Json
          created_at?: string
          description: string
          id?: string
          img?: string | null
          name: string
          points?: number
        }
        Update: {
          category?: string | null
          condition?: Json
          created_at?: string
          description?: string
          id?: string
          img?: string | null
          name?: string
          points?: number
        }
        Relationships: []
      }
      banned_member: {
        Row: {
          created_at: string
          id: number
          member_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          member_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          member_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "banned_member_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
        ]
      }
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
          reviewed_by: number | null
          role: string
          status: string | null
        }
        Insert: {
          class: string
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name: string
          reviewed_by?: number | null
          role: string
          status?: string | null
        }
        Update: {
          class?: string
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string
          reviewed_by?: number | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_application_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          dateTime: string
          id: string
          itemID: number | null
          offspec: number | null
          raid_id: string
        }
        Insert: {
          character?: string | null
          created_at?: string | null
          dateTime?: string
          id: string
          itemID?: number | null
          offspec?: number | null
          raid_id: string
        }
        Update: {
          character?: string | null
          created_at?: string | null
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
          wow_account_id: number | null
        }
        Insert: {
          character?: Json | null
          created_at?: string
          id?: number
          registration_source?: string | null
          updated_at?: string | null
          user_id?: string
          wow_account_id?: number | null
        }
        Update: {
          character?: Json | null
          created_at?: string
          id?: number
          registration_source?: string | null
          updated_at?: string | null
          user_id?: string
          wow_account_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_member_wow_account_id_fkey"
            columns: ["wow_account_id"]
            isOneToOne: false
            referencedRelation: "wow_account"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_member_role: {
        Row: {
          created_at: string
          id: string
          member_id: number | null
          member_name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          member_id?: number | null
          member_name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: number | null
          member_name?: string | null
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
          min_gs: number | null
          min_level: number | null
          name: string
          reservation_amount: number
          short_name: string | null
          size: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          min_gs?: number | null
          min_level?: number | null
          name?: string
          reservation_amount?: number
          short_name?: string | null
          size?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          min_gs?: number | null
          min_level?: number | null
          name?: string
          reservation_amount?: number
          short_name?: string | null
          size?: number | null
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
      ev_right: {
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
          hidden_id: number
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          hidden_id?: number
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          hidden_id?: number
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_role_permissions_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "ev_right"
            referencedColumns: ["id"]
          },
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
      event_reminder: {
        Row: {
          content: string | null
          event_date: string
          id: number
          reminder_type: number | null
          reset_id: string | null
        }
        Insert: {
          content?: string | null
          event_date?: string
          id?: number
          reminder_type?: number | null
          reset_id?: string | null
        }
        Update: {
          content?: string | null
          event_date?: string
          id?: number
          reminder_type?: number | null
          reset_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reminder_reset_id_fkey"
            columns: ["reset_id"]
            isOneToOne: false
            referencedRelation: "raid_resets"
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
      gs_cache: {
        Row: {
          color: string | null
          gs: number | null
          md5: string
        }
        Insert: {
          color?: string | null
          gs?: number | null
          md5: string
        }
        Update: {
          color?: string | null
          gs?: number | null
          md5?: string
        }
        Relationships: []
      }
      guild_events: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      guild_events_participants: {
        Row: {
          created_at: string
          event_id: number | null
          id: number
          member_id: number | null
          position: number | null
        }
        Insert: {
          created_at?: string
          event_id?: number | null
          id?: number
          member_id?: number | null
          position?: number | null
        }
        Update: {
          created_at?: string
          event_id?: number | null
          id?: number
          member_id?: number | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_event_participant_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_events_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "guild_events"
            referencedColumns: ["id"]
          },
        ]
      }
      hard_reserve_templates: {
        Row: {
          created_at: string
          item_id: number
          raid_id: string
        }
        Insert: {
          created_at?: string
          item_id: number
          raid_id: string
        }
        Update: {
          created_at?: string
          item_id?: number
          raid_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hard_reserve_templates_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "raid_loot_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hard_reserve_templates_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "ev_raid"
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
      member_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          member_id: number
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          member_id: number
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          member_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "member_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_achievements_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
        ]
      }
      member_profession_spells: {
        Row: {
          created_at: string
          id: number
          member_id: number
          member_proffession_id: number | null
          spell_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          member_id: number
          member_proffession_id?: number | null
          spell_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          member_id?: number
          member_proffession_id?: number | null
          spell_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "member_profession_spells_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_profession_spells_member_proffession_id_fkey"
            columns: ["member_proffession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spell_member_proffessions_spell_id_fkey"
            columns: ["spell_id"]
            isOneToOne: false
            referencedRelation: "profession_spells"
            referencedColumns: ["id"]
          },
        ]
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
      message_reaction: {
        Row: {
          created_at: string
          id: number
          member_id: number
          message_id: number
          reaction_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          member_id: number
          message_id: number
          reaction_id: number
        }
        Update: {
          created_at?: string
          id?: number
          member_id?: number
          message_id?: number
          reaction_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_reaction_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reaction_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "reset_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reaction_reaction_id_fkey"
            columns: ["reaction_id"]
            isOneToOne: false
            referencedRelation: "reaction"
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
      profession_spells: {
        Row: {
          created_at: string
          details: Json
          id: number
          item_id: number | null
          name: string
          profession_id: number | null
        }
        Insert: {
          created_at?: string
          details: Json
          id?: number
          item_id?: number | null
          name: string
          profession_id?: number | null
        }
        Update: {
          created_at?: string
          details?: Json
          id?: number
          item_id?: number | null
          name?: string
          profession_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proffession_spells_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "wow_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proffession_spells_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
        ]
      }
      professions: {
        Row: {
          created_at: string
          id: number
          name: string
          rank: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          rank?: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          rank?: number
        }
        Relationships: []
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
          min_gs: number | null
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
          min_gs?: number | null
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
          min_gs?: number | null
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
      reaction: {
        Row: {
          description: string | null
          emoji: string | null
          id: number
          shortcut: string | null
        }
        Insert: {
          description?: string | null
          emoji?: string | null
          id?: number
          shortcut?: string | null
        }
        Update: {
          description?: string | null
          emoji?: string | null
          id?: number
          shortcut?: string | null
        }
        Relationships: []
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
      reset_hard_reserve: {
        Row: {
          created_at: string
          item_id: number
          reset_id: string
        }
        Insert: {
          created_at?: string
          item_id?: number
          reset_id: string
        }
        Update: {
          created_at?: string
          item_id?: number
          reset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reset_hard_reserve_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "raid_loot_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reset_hard_reserve_reset_id_fkey"
            columns: ["reset_id"]
            isOneToOne: false
            referencedRelation: "raid_resets"
            referencedColumns: ["id"]
          },
        ]
      }
      reset_messages: {
        Row: {
          character_id: number | null
          content: string
          created_at: string
          id: number
          reset_id: string
        }
        Insert: {
          character_id?: number | null
          content: string
          created_at?: string
          id?: number
          reset_id: string
        }
        Update: {
          character_id?: number | null
          content?: string
          created_at?: string
          id?: number
          reset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reset_messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "ev_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reset_messages_reset_id_fkey"
            columns: ["reset_id"]
            isOneToOne: false
            referencedRelation: "raid_resets"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      wow_account: {
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
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      achievement_loot_cursed_rng: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_loot_greedy_fingers: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_loot_oportunist: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_loot_rnggesus_loves_you: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_loot_sniper: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_altaholic: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_architect: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_breaker_of_wings: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_commander_chaos: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_father: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_firestarter: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_frozen_vanguard: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_gnomish_vanguard: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_jungle_trailblazer: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_king: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_late_comer: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_maestro: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_master_strategist: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_rookie: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_ruins_raider: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_scarab_vanguard: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_secrets_of_dead: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_temple_pioneer: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_unicorn_hunter: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_raid_whelp_wrangler: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
      achievement_reserve_unicorn_hunter: {
        Args: {
          character_name: string
        }
        Returns: {
          achieved: boolean
          progress: number
        }[]
      }
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
      execute_raid_nagger: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_accessible_rooms: {
        Args: {
          user_id: string
        }
        Returns: string[]
      }
      get_character_id: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      get_permissions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_permission: {
        Args: {
          verify_permission: string
        }
        Returns: boolean
      }
      id_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      id_text: {
        Args: {
          id_column: string
        }
        Returns: string
      }
      initialize_permissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin_deprecated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_role: {
        Args: {
          verify_role: string
        }
        Returns: boolean
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
      raid_attendance: {
        Args: {
          character_name: string
        }
        Returns: {
          raid_name: string
          raid_date: string
          participated: boolean
          id: string
        }[]
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
          min_gs: number | null
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
