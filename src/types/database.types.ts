export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      badges: {
        Row: {
          color: string;
          created_at: string | null;
          description: string;
          icon_name: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          color: string;
          created_at?: string | null;
          description: string;
          icon_name: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          color?: string;
          created_at?: string | null;
          description?: string;
          icon_name?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      comment_votes: {
        Row: {
          comment_id: string;
          created_at: string | null;
          id: string;
          user_id: string;
          vote_type: number;
        };
        Insert: {
          comment_id: string;
          created_at?: string | null;
          id?: string;
          user_id: string;
          vote_type: number;
        };
        Update: {
          comment_id?: string;
          created_at?: string | null;
          id?: string;
          user_id?: string;
          vote_type?: number;
        };
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          author_id: string;
          code_language: string | null;
          code_snippet: string | null;
          content: string;
          created_at: string | null;
          id: string;
          image_urls: string[] | null;
          is_best_answer: boolean | null;
          parent_comment_id: string | null;
          post_id: string;
          updated_at: string | null;
          upvotes_count: number | null;
        };
        Insert: {
          author_id: string;
          code_language?: string | null;
          code_snippet?: string | null;
          content: string;
          created_at?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_best_answer?: boolean | null;
          parent_comment_id?: string | null;
          post_id: string;
          updated_at?: string | null;
          upvotes_count?: number | null;
        };
        Update: {
          author_id?: string;
          code_language?: string | null;
          code_snippet?: string | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_best_answer?: boolean | null;
          parent_comment_id?: string | null;
          post_id?: string;
          updated_at?: string | null;
          upvotes_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey";
            columns: ["parent_comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          created_at: string | null;
          id: string;
          last_read_at: string | null;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string | null;
          id?: string;
          last_read_at?: string | null;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          last_read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string | null;
          id: string;
          is_group: boolean | null;
          name: string | null;
          post_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_group?: boolean | null;
          name?: string | null;
          post_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_group?: boolean | null;
          name?: string | null;
          post_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      followers: {
        Row: {
          created_at: string | null;
          follower_id: string;
          following_id: string;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          follower_id: string;
          following_id: string;
          id?: string;
        };
        Update: {
          created_at?: string | null;
          follower_id?: string;
          following_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "followers_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      majors: {
        Row: {
          category: string;
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          category?: string;
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          code_language: string | null;
          code_snippet: string | null;
          content: string | null;
          conversation_id: string;
          created_at: string | null;
          id: string;
          image_url: string | null;
          sender_id: string;
        };
        Insert: {
          code_language?: string | null;
          code_snippet?: string | null;
          content?: string | null;
          conversation_id: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          sender_id: string;
        };
        Update: {
          code_language?: string | null;
          code_snippet?: string | null;
          content?: string | null;
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          actor_id: string;
          body: string;
          comment_id: string | null;
          conversation_id: string | null;
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          post_id: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          actor_id: string;
          body: string;
          comment_id?: string | null;
          conversation_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          post_id?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          actor_id?: string;
          body?: string;
          comment_id?: string | null;
          conversation_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          post_id?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_likes: {
        Row: {
          created_at: string | null;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          answers_count: number | null;
          author_id: string;
          category: string;
          code_language: string | null;
          code_snippet: string | null;
          content: string;
          course_code: string | null;
          created_at: string | null;
          id: string;
          image_urls: string[] | null;
          is_solved: boolean | null;
          tags: string[] | null;
          title: string;
          university_id: string | null;
          updated_at: string | null;
          upvotes_count: number | null;
          views_count: number | null;
        };
        Insert: {
          answers_count?: number | null;
          author_id: string;
          category: string;
          code_language?: string | null;
          code_snippet?: string | null;
          content: string;
          course_code?: string | null;
          created_at?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_solved?: boolean | null;
          tags?: string[] | null;
          title: string;
          university_id?: string | null;
          updated_at?: string | null;
          upvotes_count?: number | null;
          views_count?: number | null;
        };
        Update: {
          answers_count?: number | null;
          author_id?: string;
          category?: string;
          code_language?: string | null;
          code_snippet?: string | null;
          content?: string;
          course_code?: string | null;
          created_at?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_solved?: boolean | null;
          tags?: string[] | null;
          title?: string;
          university_id?: string | null;
          updated_at?: string | null;
          upvotes_count?: number | null;
          views_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          answers_count: number | null;
          avatar_url: string | null;
          best_answers_count: number | null;
          bio: string | null;
          created_at: string | null;
          followers_count: number | null;
          following_count: number | null;
          full_name: string;
          gpa: number | null;
          helpful_answers_count: number | null;
          id: string;
          is_top_student: boolean | null;
          major: string | null;
          program: string | null;
          questions_count: number | null;
          reputation: number | null;
          semester: number | null;
          university_id: string | null;
          updated_at: string | null;
          username: string;
          year: string | null;
        };
        Insert: {
          answers_count?: number | null;
          avatar_url?: string | null;
          best_answers_count?: number | null;
          bio?: string | null;
          created_at?: string | null;
          followers_count?: number | null;
          following_count?: number | null;
          full_name: string;
          gpa?: number | null;
          helpful_answers_count?: number | null;
          id: string;
          is_top_student?: boolean | null;
          major?: string | null;
          program?: string | null;
          questions_count?: number | null;
          reputation?: number | null;
          semester?: number | null;
          university_id?: string | null;
          updated_at?: string | null;
          username: string;
          year?: string | null;
        };
        Update: {
          answers_count?: number | null;
          avatar_url?: string | null;
          best_answers_count?: number | null;
          bio?: string | null;
          created_at?: string | null;
          followers_count?: number | null;
          following_count?: number | null;
          full_name?: string;
          gpa?: number | null;
          helpful_answers_count?: number | null;
          id?: string;
          is_top_student?: boolean | null;
          major?: string | null;
          program?: string | null;
          questions_count?: number | null;
          reputation?: number | null;
          semester?: number | null;
          university_id?: string | null;
          updated_at?: string | null;
          username?: string;
          year?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_posts: {
        Row: {
          created_at: string | null;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      universities: {
        Row: {
          banner_url: string | null;
          created_at: string | null;
          id: string;
          location: string | null;
          logo_url: string | null;
          name: string;
          short_name: string;
        };
        Insert: {
          banner_url?: string | null;
          created_at?: string | null;
          id?: string;
          location?: string | null;
          logo_url?: string | null;
          name: string;
          short_name: string;
        };
        Update: {
          banner_url?: string | null;
          created_at?: string | null;
          id?: string;
          location?: string | null;
          logo_url?: string | null;
          name?: string;
          short_name?: string;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          badge_id: string;
          earned_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          badge_id: string;
          earned_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          badge_id?: string;
          earned_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
