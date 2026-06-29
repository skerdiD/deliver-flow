export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client";

export type ClientStatus = "active" | "inactive" | "archived";

export type ClientInvitationStatus = "pending" | "accepted" | "expired";

export type ProjectStatus =
  | "draft"
  | "active"
  | "in_progress"
  | "waiting_feedback"
  | "completed"
  | "archived";

export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "waiting_approval"
  | "approved"
  | "completed";

export type TaskStatus = "todo" | "in_progress" | "blocked" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export type ProjectUpdateType =
  | "general"
  | "progress"
  | "milestone"
  | "payment"
  | "file"
  | "approval";

export type FeedbackStatus = "open" | "reviewed" | "resolved";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "overdue" | "void";

export type ProjectFileCategory =
  | "brief"
  | "design"
  | "document"
  | "invoice"
  | "deliverable"
  | "other";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };

      clients: {
        Row: {
          id: string;
          profile_id: string | null;
          company_name: string;
          contact_name: string;
          email: string;
          phone: string | null;
          status: ClientStatus;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          company_name: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          status?: ClientStatus;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          company_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          status?: ClientStatus;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
      };

      client_invitations: {
        Row: {
          id: string;
          email: string;
          client_id: string | null;
          token_hash: string;
          status: ClientInvitationStatus;
          invited_by: string | null;
          accepted_by: string | null;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          client_id?: string | null;
          token_hash: string;
          status?: ClientInvitationStatus;
          invited_by?: string | null;
          accepted_by?: string | null;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          client_id?: string | null;
          token_hash?: string;
          status?: ClientInvitationStatus;
          invited_by?: string | null;
          accepted_by?: string | null;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      projects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          status: ProjectStatus;
          progress: number;
          live_demo_url: string | null;
          repository_url: string | null;
          deadline: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          status?: ProjectStatus;
          progress?: number;
          live_demo_url?: string | null;
          repository_url?: string | null;
          deadline?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: ProjectStatus;
          progress?: number;
          live_demo_url?: string | null;
          repository_url?: string | null;
          deadline?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
      };

      project_assignments: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          assigned_by: string | null;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          assigned_by?: string | null;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          client_id?: string;
          assigned_by?: string | null;
          assigned_at?: string;
        };
      };

      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: MilestoneStatus;
          due_date: string | null;
          position: number;
          is_visible_to_client: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: MilestoneStatus;
          due_date?: string | null;
          position?: number;
          is_visible_to_client?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: MilestoneStatus;
          due_date?: string | null;
          position?: number;
          is_visible_to_client?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      tasks: {
        Row: {
          id: string;
          project_id: string;
          milestone_id: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          position: number;
          is_visible_to_client: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          milestone_id?: string | null;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          position?: number;
          is_visible_to_client?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          milestone_id?: string | null;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          position?: number;
          is_visible_to_client?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      project_updates: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          body: string;
          update_type: ProjectUpdateType;
          is_visible_to_client: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          body: string;
          update_type?: ProjectUpdateType;
          is_visible_to_client?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          body?: string;
          update_type?: ProjectUpdateType;
          is_visible_to_client?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      feedback: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          created_by: string | null;
          message: string;
          status: FeedbackStatus;
          admin_response: string | null;
          is_visible_to_client: boolean;
          archived_at: string | null;
          resolved_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          created_by?: string | null;
          message: string;
          status?: FeedbackStatus;
          admin_response?: string | null;
          is_visible_to_client?: boolean;
          archived_at?: string | null;
          resolved_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          client_id?: string;
          created_by?: string | null;
          message?: string;
          status?: FeedbackStatus;
          admin_response?: string | null;
          is_visible_to_client?: boolean;
          archived_at?: string | null;
          resolved_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      approvals: {
        Row: {
          id: string;
          project_id: string;
          milestone_id: string | null;
          title: string;
          description: string | null;
          status: ApprovalStatus;
          requested_by: string | null;
          responded_by: string | null;
          response_note: string | null;
          cancel_reason: string | null;
          requested_at: string;
          responded_at: string | null;
          cancelled_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          milestone_id?: string | null;
          title: string;
          description?: string | null;
          status?: ApprovalStatus;
          requested_by?: string | null;
          responded_by?: string | null;
          response_note?: string | null;
          cancel_reason?: string | null;
          requested_at?: string;
          responded_at?: string | null;
          cancelled_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          milestone_id?: string | null;
          title?: string;
          description?: string | null;
          status?: ApprovalStatus;
          requested_by?: string | null;
          responded_by?: string | null;
          response_note?: string | null;
          cancel_reason?: string | null;
          requested_at?: string;
          responded_at?: string | null;
          cancelled_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      payments: {
        Row: {
          id: string;
          project_id: string;
          amount_cents: number;
          currency: string;
          status: PaymentStatus;
          due_date: string | null;
          paid_at: string | null;
          voided_at: string | null;
          void_reason: string | null;
          deleted_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          amount_cents: number;
          currency?: string;
          status?: PaymentStatus;
          due_date?: string | null;
          paid_at?: string | null;
          voided_at?: string | null;
          void_reason?: string | null;
          deleted_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          amount_cents?: number;
          currency?: string;
          status?: PaymentStatus;
          due_date?: string | null;
          paid_at?: string | null;
          voided_at?: string | null;
          void_reason?: string | null;
          deleted_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      project_files: {
        Row: {
          id: string;
          project_id: string;
          uploaded_by: string | null;
          file_name: string;
          bucket_name: string;
          storage_path: string;
          file_type: string | null;
          file_size: number | null;
          category: ProjectFileCategory;
          is_visible_to_client: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          uploaded_by?: string | null;
          file_name: string;
          bucket_name?: string;
          storage_path: string;
          file_type?: string | null;
          file_size?: number | null;
          category?: ProjectFileCategory;
          is_visible_to_client?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          uploaded_by?: string | null;
          file_name?: string;
          bucket_name?: string;
          storage_path?: string;
          file_type?: string | null;
          file_size?: number | null;
          category?: ProjectFileCategory;
          is_visible_to_client?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };

    Views: Record<string, never>;

    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_client_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_client_assigned_to_project: {
        Args: {
          project_uuid: string;
        };
        Returns: boolean;
      };
      respond_to_approval: {
        Args: {
          p_approval_id: string;
          p_status: ApprovalStatus;
          p_response_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["approvals"]["Row"];
      };
    };

    Enums: {
      app_role: UserRole;
      client_invitation_status: ClientInvitationStatus;
      client_status: ClientStatus;
      project_status: ProjectStatus;
      milestone_status: MilestoneStatus;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      project_update_type: ProjectUpdateType;
      feedback_status: FeedbackStatus;
      approval_status: ApprovalStatus;
      payment_status: PaymentStatus;
      project_file_category: ProjectFileCategory;
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

export type Profile = Tables<"profiles">;
export type Client = Tables<"clients">;
export type ClientInvitation = Tables<"client_invitations">;
export type Project = Tables<"projects">;
export type ProjectAssignment = Tables<"project_assignments">;
export type Milestone = Tables<"milestones">;
export type Task = Tables<"tasks">;
export type ProjectUpdate = Tables<"project_updates">;
export type Feedback = Tables<"feedback">;
export type Approval = Tables<"approvals">;
export type Payment = Tables<"payments">;
export type ProjectFile = Tables<"project_files">;
