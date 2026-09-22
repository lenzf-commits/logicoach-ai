export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          current_level: number;
          current_xp: number;
          total_xp: number;
          total_interviews_completed: number;
          longest_streak_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          current_level?: number;
          current_xp?: number;
          total_xp?: number;
          total_interviews_completed?: number;
          longest_streak_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          current_level?: number;
          current_xp?: number;
          total_xp?: number;
          total_interviews_completed?: number;
          longest_streak_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_path: string | null;
          content_text: string | null;
          extracted_text: string | null;
          parsed_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_path?: string | null;
          content_text?: string | null;
          extracted_text?: string | null;
          parsed_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_path?: string | null;
          content_text?: string | null;
          extracted_text?: string | null;
          parsed_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      job_postings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company_name: string | null;
          description: string;
          parsed_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company_name?: string | null;
          description: string;
          parsed_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          company_name?: string | null;
          description?: string;
          parsed_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          job_posting_id: string | null;
          status: Database["public"]["Enums"]["interview_status"];
          duration_minutes: number | null;
          level: number | null;
          persona: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          job_posting_id?: string | null;
          status?: Database["public"]["Enums"]["interview_status"];
          duration_minutes?: number | null;
          level?: number | null;
          persona?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_posting_id?: string | null;
          status?: Database["public"]["Enums"]["interview_status"];
          duration_minutes?: number | null;
          level?: number | null;
          persona?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interview_messages: {
        Row: {
          id: string;
          interview_id: string;
          user_id: string;
          role: "interviewer" | "candidate";
          content: string;
          message_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          user_id: string;
          role: "interviewer" | "candidate";
          content: string;
          message_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          user_id?: string;
          role?: "interviewer" | "candidate";
          content?: string;
          message_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      interview_evaluations: {
        Row: {
          id: string;
          interview_id: string;
          user_id: string;
          overall_score: number;
          self_presentation_score: number;
          communication_score: number;
          structure_score: number;
          logistics_keywords_score: number;
          confidence_score: number;
          filler_word_count: number;
          average_answer_length: number;
          strengths: Json;
          weaknesses: Json;
          recommendations: Json;
          ai_summary: string | null;
          ai_strengths: Json;
          ai_weaknesses: Json;
          ai_recommendations: Json;
          ai_top_risks: Json;
          ai_improved_answers: Json;
          ai_created_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          user_id: string;
          overall_score: number;
          self_presentation_score: number;
          communication_score: number;
          structure_score: number;
          logistics_keywords_score: number;
          confidence_score: number;
          filler_word_count?: number;
          average_answer_length?: number;
          strengths?: Json;
          weaknesses?: Json;
          recommendations?: Json;
          ai_summary?: string | null;
          ai_strengths?: Json;
          ai_weaknesses?: Json;
          ai_recommendations?: Json;
          ai_top_risks?: Json;
          ai_improved_answers?: Json;
          ai_created_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          user_id?: string;
          overall_score?: number;
          self_presentation_score?: number;
          communication_score?: number;
          structure_score?: number;
          logistics_keywords_score?: number;
          confidence_score?: number;
          filler_word_count?: number;
          average_answer_length?: number;
          strengths?: Json;
          weaknesses?: Json;
          recommendations?: Json;
          ai_summary?: string | null;
          ai_strengths?: Json;
          ai_weaknesses?: Json;
          ai_recommendations?: Json;
          ai_top_risks?: Json;
          ai_improved_answers?: Json;
          ai_created_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      replay_analyses: {
        Row: { interview_id: string; user_id: string; input_hash: string; report: Json; created_at: string };
        Insert: { interview_id: string; user_id: string; input_hash: string; report: Json; created_at?: string };
        Update: { input_hash?: string; report?: Json; created_at?: string };
        Relationships: [];
      };
      progress_history: {
        Row: {
          id: string;
          user_id: string;
          interview_id: string | null;
          xp_delta: number;
          xp_gained: number | null;
          previous_level: number | null;
          new_level: number | null;
          level_after: number;
          total_xp_after: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          interview_id?: string | null;
          xp_delta?: number;
          xp_gained?: number | null;
          previous_level?: number | null;
          new_level?: number | null;
          level_after: number;
          total_xp_after: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          interview_id?: string | null;
          xp_delta?: number;
          xp_gained?: number | null;
          previous_level?: number | null;
          new_level?: number | null;
          level_after?: number;
          total_xp_after?: number;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      interview_status: "draft" | "prepared" | "ready" | "active" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
