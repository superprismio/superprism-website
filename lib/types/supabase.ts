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
      bot_configs: {
        Row: {
          enabled: boolean | null
          heap_id: string | null
          id: string
          platform: string | null
          platform_id: string | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          enabled?: boolean | null
          heap_id?: string | null
          id?: string
          platform?: string | null
          platform_id?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          enabled?: boolean | null
          heap_id?: string | null
          id?: string
          platform?: string | null
          platform_id?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_configs_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: true
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          heap_id: string
          id: string
          role: string
          session_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          heap_id: string
          id: string
          role: string
          session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          heap_id?: string
          id?: string
          role?: string
          session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          archived: boolean | null
          created_at: string | null
          created_by: string | null
          heap_id: string
          id: string
          last_message_at: string | null
          meta: Json | null
          system_prompt: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          created_by?: string | null
          heap_id: string
          id: string
          last_message_at?: string | null
          meta?: Json | null
          system_prompt?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          created_by?: string | null
          heap_id?: string
          id?: string
          last_message_at?: string | null
          meta?: Json | null
          system_prompt?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      document_rows: {
        Row: {
          created_at: string | null
          file_id: string
          id: string
          row_data: Json
          row_number: number | null
        }
        Insert: {
          created_at?: string | null
          file_id: string
          id?: string
          row_data: Json
          row_number?: number | null
        }
        Update: {
          created_at?: string | null
          file_id?: string
          id?: string
          row_data?: Json
          row_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_rows_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      early_signups: {
        Row: {
          created_at: string | null
          email: string
          id: string
          metadata: Json
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json
          source?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          deleted_at: string | null
          extracted_file_size: number | null
          file_hash: string | null
          file_name: string | null
          heap_id: string | null
          id: string
          meta: Json
          source_type: string | null
          status: string | null
          storage_path: string | null
          synced_at: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploader_id: string | null
        }
        Insert: {
          deleted_at?: string | null
          extracted_file_size?: number | null
          file_hash?: string | null
          file_name?: string | null
          heap_id?: string | null
          id?: string
          meta?: Json
          source_type?: string | null
          status?: string | null
          storage_path?: string | null
          synced_at?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Update: {
          deleted_at?: string | null
          extracted_file_size?: number | null
          file_hash?: string | null
          file_name?: string | null
          heap_id?: string | null
          id?: string
          meta?: Json
          source_type?: string | null
          status?: string | null
          storage_path?: string | null
          synced_at?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      heap_activities: {
        Row: {
          action_at: string | null
          activity_type: Database["public"]["Enums"]["heap_activity_type"]
          created_at: string | null
          created_by: string | null
          cta: Json
          heap_id: string
          id: string
          metadata: Json
          status: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
          visibility: Database["public"]["Enums"]["heap_visibility"] | null
        }
        Insert: {
          action_at?: string | null
          activity_type: Database["public"]["Enums"]["heap_activity_type"]
          created_at?: string | null
          created_by?: string | null
          cta?: Json
          heap_id: string
          id?: string
          metadata?: Json
          status?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["heap_visibility"] | null
        }
        Update: {
          action_at?: string | null
          activity_type?: Database["public"]["Enums"]["heap_activity_type"]
          created_at?: string | null
          created_by?: string | null
          cta?: Json
          heap_id?: string
          id?: string
          metadata?: Json
          status?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["heap_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "heap_activities_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      heap_api_audit: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          heap_id: string
          id: string
          key_id: string | null
          request_payload: Json
          response_bytes: number | null
          status: string
          tool: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          heap_id: string
          id?: string
          key_id?: string | null
          request_payload?: Json
          response_bytes?: number | null
          status?: string
          tool: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          heap_id?: string
          id?: string
          key_id?: string | null
          request_payload?: Json
          response_bytes?: number | null
          status?: string
          tool?: string
        }
        Relationships: [
          {
            foreignKeyName: "heap_api_audit_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heap_api_audit_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "heap_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      heap_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          heap_id: string
          id: string
          key_hash: string
          label: string | null
          last_used_at: string | null
          metadata: Json
          revoked_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          heap_id: string
          id?: string
          key_hash: string
          label?: string | null
          last_used_at?: string | null
          metadata?: Json
          revoked_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          heap_id?: string
          id?: string
          key_hash?: string
          label?: string | null
          last_used_at?: string | null
          metadata?: Json
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heap_api_keys_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      heaps: {
        Row: {
          allowed_group_ids: string[] | null
          avatar_url: string | null
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          visibility: Database["public"]["Enums"]["heap_visibility"] | null
        }
        Insert: {
          allowed_group_ids?: string[] | null
          avatar_url?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          visibility?: Database["public"]["Enums"]["heap_visibility"] | null
        }
        Update: {
          allowed_group_ids?: string[] | null
          avatar_url?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          visibility?: Database["public"]["Enums"]["heap_visibility"] | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string | null
          email: string | null
          expires_at: string | null
          heap_id: string
          id: string
          invited_by: string
          role: string | null
          token: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          heap_id: string
          id?: string
          invited_by: string
          role?: string | null
          token?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          heap_id?: string
          id?: string
          invited_by?: string
          role?: string | null
          token?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      job_runs: {
        Row: {
          created_at: string | null
          errors: Json | null
          file_ids: string[]
          heap_id: string
          job_id: string
          status: string
          step_status: Json
          steps: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          errors?: Json | null
          file_ids: string[]
          heap_id: string
          job_id?: string
          status: string
          step_status?: Json
          steps: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          errors?: Json | null
          file_ids?: string[]
          heap_id?: string
          job_id?: string
          status?: string
          step_status?: Json
          steps?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_runs_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_chunks: {
        Row: {
          chunk_index: number | null
          content: string | null
          created_at: string | null
          embedding: string | null
          file_id: string | null
          heap_id: string | null
          id: string
          metadata: Json | null
          storage_path: string | null
          tag1: string | null
          tag2: string | null
          tag3: string | null
          tags: string[] | null
        }
        Insert: {
          chunk_index?: number | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          file_id?: string | null
          heap_id?: string | null
          id?: string
          metadata?: Json | null
          storage_path?: string | null
          tag1?: string | null
          tag2?: string | null
          tag3?: string | null
          tags?: string[] | null
        }
        Update: {
          chunk_index?: number | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          file_id?: string | null
          heap_id?: string | null
          id?: string
          metadata?: Json | null
          storage_path?: string | null
          tag1?: string | null
          tag2?: string | null
          tag3?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      kb_tags: {
        Row: {
          created_at: string | null
          description: string | null
          heap_id: string | null
          is_active: boolean | null
          label: string
          slug: string
          synonyms: string[] | null
          tag_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          heap_id?: string | null
          is_active?: boolean | null
          label: string
          slug: string
          synonyms?: string[] | null
          tag_id?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          heap_id?: string | null
          is_active?: boolean | null
          label?: string
          slug?: string
          synonyms?: string[] | null
          tag_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      linked_repos: {
        Row: {
          auth_token: string | null
          branch: string | null
          created_at: string | null
          directory: string | null
          heap_id: string
          id: string
          ignore_patterns: Json | null
          last_sync_commit_sha: string | null
          last_synced_at: string | null
          repo_url: string
          updated_at: string | null
        }
        Insert: {
          auth_token?: string | null
          branch?: string | null
          created_at?: string | null
          directory?: string | null
          heap_id: string
          id?: string
          ignore_patterns?: Json | null
          last_sync_commit_sha?: string | null
          last_synced_at?: string | null
          repo_url: string
          updated_at?: string | null
        }
        Update: {
          auth_token?: string | null
          branch?: string | null
          created_at?: string | null
          directory?: string | null
          heap_id?: string
          id?: string
          ignore_patterns?: Json | null
          last_sync_commit_sha?: string | null
          last_synced_at?: string | null
          repo_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linked_repos_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          heap_id: string | null
          id: string
          joined_at: string | null
          member_bio: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          heap_id?: string | null
          id?: string
          joined_at?: string | null
          member_bio?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          heap_id?: string | null
          id?: string
          joined_at?: string | null
          member_bio?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_heap_id_fkey"
            columns: ["heap_id"]
            isOneToOne: false
            referencedRelation: "heaps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          link: string | null
          name: string | null
          screenshot_url: string | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          name?: string | null
          screenshot_url?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          name?: string | null
          screenshot_url?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_projects_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_social_links: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          updated_at: string | null
          user_profile_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_social_links_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          alt_profile_pic_1: string | null
          alt_profile_pic_2: string | null
          bio: string | null
          created_at: string | null
          ethereum_address: string | null
          featured: boolean | null
          id: string
          name: string | null
          profile_image_url: string | null
          roles: string[] | null
          skills: string[] | null
          status: string | null
          tagline: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alt_profile_pic_1?: string | null
          alt_profile_pic_2?: string | null
          bio?: string | null
          created_at?: string | null
          ethereum_address?: string | null
          featured?: boolean | null
          id?: string
          name?: string | null
          profile_image_url?: string | null
          roles?: string[] | null
          skills?: string[] | null
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alt_profile_pic_1?: string | null
          alt_profile_pic_2?: string | null
          bio?: string | null
          created_at?: string | null
          ethereum_address?: string | null
          featured?: boolean | null
          id?: string
          name?: string | null
          profile_image_url?: string | null
          roles?: string[] | null
          skills?: string[] | null
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { invite_token: string }; Returns: Json }
      add_heap_member: {
        Args: {
          member_email: string
          member_role?: string
          target_heap_id: string
        }
        Returns: Json
      }
      approve_user_by_email: { Args: { user_email: string }; Returns: Json }
      create_heap: {
        Args: {
          avatar_url?: string
          description?: string
          group_ids?: string[]
          heap_name: string
          heap_visibility?: Database["public"]["Enums"]["heap_visibility"]
        }
        Returns: string
      }
      create_invite: {
        Args: {
          expires_in_days?: number
          invite_email?: string
          invite_role?: string
          target_heap_id: string
        }
        Returns: Json
      }
      delete_kb_chunks_by_file_id: {
        Args: { file_id_param: string }
        Returns: undefined
      }
      get_files_by_tags_any: {
        Args: { _tags: string[] }
        Returns: {
          deleted_at: string | null
          extracted_file_size: number | null
          file_hash: string | null
          file_name: string | null
          heap_id: string | null
          id: string
          meta: Json
          source_type: string | null
          status: string | null
          storage_path: string | null
          synced_at: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploader_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "files"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_heap_invites: {
        Args: { target_heap_id: string }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          heap_id: string
          invite_id: string
          invited_by_email: string
          invited_by_name: string
          is_expired: boolean
          is_used: boolean
          role: string
          token: string
          used_at: string
        }[]
      }
      get_heap_members: {
        Args: { target_heap_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          heap_id: string
          joined_at: string
          member_bio: string
          membership_id: string
          role: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_my_memberships: {
        Args: never
        Returns: {
          allowed_group_ids: string[]
          avatar_url: string
          description: string
          display_name: string
          heap_id: string
          heap_name: string
          role: string
          visibility: Database["public"]["Enums"]["heap_visibility"]
        }[]
      }
      is_heap_admin: {
        Args: { p_heap_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_heap_member: {
        Args: { allowed_roles?: string[]; p_heap_id: string }
        Returns: boolean
      }
      remove_heap_member: {
        Args: { target_membership_id: string }
        Returns: Json
      }
      revoke_invite: { Args: { invite_id: string }; Returns: Json }
      search_chunks_expanded: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_heap_visibility: {
        Args: {
          group_ids?: string[]
          new_visibility: Database["public"]["Enums"]["heap_visibility"]
          target_heap_id: string
        }
        Returns: Json
      }
      update_member_role: {
        Args: { new_role: string; target_membership_id: string }
        Returns: Json
      }
    }
    Enums: {
      heap_activity_type:
        | "note"
        | "proposal"
        | "event"
        | "welcome"
        | "recap"
        | "task"
      heap_visibility: "public" | "private" | "group"
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
      heap_activity_type: [
        "note",
        "proposal",
        "event",
        "welcome",
        "recap",
        "task",
      ],
      heap_visibility: ["public", "private", "group"],
    },
  },
} as const
